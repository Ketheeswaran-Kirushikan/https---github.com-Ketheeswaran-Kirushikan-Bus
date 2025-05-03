import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  console.log('POST request received at /api/auth/register');
  try {
    const { email, password, name, nic, phoneNumber } = await request.json();

    if (!email || !password || !name || !nic || !phoneNumber) {
      return NextResponse.json({ error: 'Email, password, name, NIC, and phone number are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: uuidv4(),
      userName: name,
      nic,
      email,
      phoneNumber,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);
    console.log(`Inserted user with _id: ${result.insertedId}`);

    const response = NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
    response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins (adjust for production)
    response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error in /api/auth/register:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }
}

export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}