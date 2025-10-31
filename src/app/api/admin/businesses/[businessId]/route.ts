import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/server/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const db = adminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    const businessDoc = await db.collection('businesses').doc(businessId).get();

    if (!businessDoc.exists) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessData = businessDoc.data();
    return NextResponse.json({
      success: true,
      business: {
        businessId,
        ...businessData
      }
    });
  } catch (e: any) {
    console.error('Error getting business:', e);
    return NextResponse.json(
      { error: 'Failed to get business', details: e.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ businessId: string }> }) {
  try {
    const { businessId } = await params;
    const db = adminDb();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });

    const body = await request.json();
    let { pointsLabel, pointsLabelShort } = body as { pointsLabel?: string; pointsLabelShort?: string };

    if (typeof pointsLabel !== 'string' || pointsLabel.trim().length < 2 || pointsLabel.trim().length > 48) {
      return NextResponse.json({ error: 'Invalid pointsLabel' }, { status: 400 });
    }
    pointsLabel = pointsLabel.trim();
    if (pointsLabelShort && typeof pointsLabelShort === 'string') {
      pointsLabelShort = pointsLabelShort.trim();
      if (pointsLabelShort.length > 12) return NextResponse.json({ error: 'pointsLabelShort too long' }, { status: 400 });
    } else {
      pointsLabelShort = undefined;
    }

    const ref = db.collection('businesses').doc(businessId);
    await ref.set({ pointsLabel, pointsLabelShort }, { merge: true });

    const snap = await ref.get();
    const data = snap.exists ? snap.data() : {};
    return NextResponse.json({ businessId, name: data?.name ?? businessId, pointsLabel: data?.pointsLabel, pointsLabelShort: data?.pointsLabelShort });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update points label' }, { status: 500 });
  }
}


