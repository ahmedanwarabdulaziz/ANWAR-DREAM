import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/server/firebase-admin';

export async function GET(_req: NextRequest) {
  try {
    const db = adminDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });

    const snap = await db.collection('businesses').get();
    const businesses = snap.docs.map(d => {
      const data = d.data() || {};
      return { businessId: d.id, name: (data.name ?? d.id), pointsLabel: data.pointsLabel as string | undefined };
    });
    // Sort by name asc
    businesses.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return NextResponse.json({ businesses });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unable to fetch businesses' }, { status: 500 });
  }
}
