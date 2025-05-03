import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { Ticket, Bus, Route, UserProfile } from '@/types/schema';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  console.log('POST request received at /api/booking');
  try {
    const { userId, busId, route, seatCount }: { userId: string; busId: string; route: Route; seatCount: number } = await request.json();

    // Detailed validation
    if (!userId) {
      const response = NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return response;
    }
    if (!busId) {
      const response = NextResponse.json({ error: 'Missing busId' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return response;
    }
    if (!route || typeof route !== 'object' || !route.start || !route.end || !route.date) {
      const response = NextResponse.json({ error: 'Missing or invalid route. Must include start, end, and date.' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return response;
    }
    if (typeof seatCount !== 'number' || seatCount <= 0) {
      const response = NextResponse.json({ error: 'seatCount must be a positive number' }, { status: 400 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return response;
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Start a session for atomic operations
    const session = client.startSession();

    try {
      const result = await session.withTransaction(async () => {
        // Find the user
        const user = await db.collection('users').findOne({ id: userId }, { session }) as UserProfile | null;
        if (!user) {
          throw new Error('User not found');
        }

        // Find the bus
        const bus = await db.collection('buses').findOne({ id: busId }, { session }) as Bus | null;
        if (!bus) {
          throw new Error('Bus not found');
        }

        // Find available seats
        const availableSeats = bus.seats?.filter(seat => seat.isAvailable) || [];
        if (availableSeats.length < seatCount) {
          throw new Error('Not enough available seats');
        }

        // Select the seats to book
        const seatsToBook = availableSeats.slice(0, seatCount).map(seat => seat.number);

        // Update the bus to mark seats as unavailable
        await db.collection('buses').updateOne(
          { id: busId },
          {
            $set: {
              'seats.$[elem].isAvailable': false,
            },
          },
          {
            arrayFilters: [{ 'elem.number': { $in: seatsToBook } }],
            session,
          }
        );

        // Calculate total price
        const seatPrices = seatsToBook.map(seatNumber => {
          const seat = bus.seats?.find(s => s.number === seatNumber);
          return seat?.price || bus.price;
        });
        const totalPrice = seatPrices.reduce((sum, price) => sum + price, 0);

        // Create the ticket
        const ticket: Ticket = {
          id: uuidv4(),
          userName: user.userName,
          nic: user.nic,
          startPoint: route.start,
          endPoint: route.end,
          busName: bus.name,
          busType: bus.type,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime,
          seatNumbers: seatsToBook,
          totalPrice,
          bookingDate: new Date(),
          route, // Include the full route object
        };

        const result = await db.collection('tickets').insertOne(ticket, { session });

        const response = NextResponse.json({ id: result.insertedId, ...ticket }, { status: 201 });
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return response;
      });

      // Ensure the transaction result (response) is returned
      return result;
    } finally {
      await session.endSession();
    }
  } catch (error: any) {
    console.error('Error in /api/booking:', error);
    const response = NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

export async function GET() {
  console.log('GET request received at /api/booking');
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const tickets = await db.collection('tickets').find().toArray();

    const response = NextResponse.json(tickets as Ticket[], { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error in /api/booking GET:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

export async function OPTIONS() {
  console.log('OPTIONS request received at /api/booking');
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}