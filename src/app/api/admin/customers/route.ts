import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/server/firebase-admin';

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  try {
    const db = adminDb();
    if (!db) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = (searchParams.get('search') ?? '').toLowerCase().trim();
    const filterBusinessId = (searchParams.get('businessId') ?? '').trim();

    // Fetch all users for MVP
    let querySnap = await db.collection('users').get();
    let users: any[] = querySnap.docs.map(doc => ({ ...doc.data(), userId: doc.id }));

    if (filterBusinessId) {
      users = users.filter(u => Array.isArray(u?.businessAssignments) && u.businessAssignments.some((ba: any) => ba?.businessId === filterBusinessId));
    }

    if (search) {
      users = users.filter(u =>
        ((u?.name || '').toLowerCase().includes(search)) ||
        ((u?.email || '').toLowerCase().includes(search)) ||
        ((u?.userId || '').toLowerCase().includes(search))
      );
    }

    // Collect ALL business IDs across visible users for name/label resolution
    const allBusinessIds = new Set<string>();
    users.forEach(u => {
      const assignments = Array.isArray(u?.businessAssignments) ? u.businessAssignments : [];
      assignments.forEach((a: any) => { if (a?.businessId) allBusinessIds.add(a.businessId); });
    });

    const businessMeta = new Map<string, { name: string; pointsLabel?: string }>();
    if (allBusinessIds.size > 0) {
      const lookups = Array.from(allBusinessIds).map(async (id) => {
        try {
          const snap = await db.collection('businesses').doc(id).get();
          const data = snap.exists ? snap.data() || {} : {};
          const name = data.name ?? id;
          const pointsLabel = data.pointsLabel as string | undefined;
          businessMeta.set(id, { name, pointsLabel });
        } catch {
          businessMeta.set(id, { name: id });
        }
      });
      await Promise.all(lookups);
    }

    const usersDecorated = users.map(u => {
      const assignments = Array.isArray(u?.businessAssignments) ? u.businessAssignments : [];

      // Aggregate points & build breakdown with label
      let offerPoints = 0; let purchasePoints = 0; let totalPoints = 0;
      const businessBreakdown = assignments.map((a: any) => {
        const meta = businessMeta.get(a.businessId) || { name: a.businessId, pointsLabel: undefined };
        const baseLabel = meta.pointsLabel || `${meta.name} Points`;
        const offer = a.offerPoints ?? 0;
        const purchase = a.purchasePoints ?? 0;
        const total = a.totalPoints ?? (offer + purchase);
        offerPoints += offer;
        purchasePoints += purchase;
        totalPoints += total;
        return {
          businessId: a.businessId,
          name: meta.name,
          pointsLabel: baseLabel,
          offerPoints: offer,
          purchasePoints: purchase,
          totalPoints: total,
        };
      });

      // Display name rule
      let businessDisplayName: string;
      if (assignments.length === 1) {
        const only = assignments[0];
        const meta = businessMeta.get(only.businessId) || { name: only.businessId };
        businessDisplayName = meta.name || 'Assigned';
      } else if (assignments.length > 1) {
        businessDisplayName = 'Public';
      } else {
        businessDisplayName = u?.public ? 'Public' : 'Unassigned';
      }

      return { ...u, businessDisplayName, offerPoints, purchasePoints, totalPoints, businessBreakdown };
    });

    const total = usersDecorated.length;
    const sorted = usersDecorated.sort((a: any, b: any) => (b.createdAt?.localeCompare?.(a.createdAt) || 0));
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageUsers = sorted.slice(start, end);

    return NextResponse.json({
      users: pageUsers,
      page,
      total,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unable to fetch customers' }, { status: 500 });
  }
}
