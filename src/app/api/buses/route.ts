import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { Bus } from '@/types/schema';

export async function GET() {
  console.log('GET request received at /api/buses');
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const buses = await db.collection('buses').find().toArray();

    // Calculate available seat count for each bus
    const busesWithAvailability = buses.map((bus: Bus) => ({
      ...bus,
      availableSeats: bus.seats?.filter(seat => seat.isAvailable).length || 0,
      totalSeats: bus.totalSeats,
    }));

    const response = NextResponse.json(busesWithAvailability as Bus[], { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error in /api/buses:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

export async function OPTIONS() {
  console.log('OPTIONS request received at /api/buses');
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}