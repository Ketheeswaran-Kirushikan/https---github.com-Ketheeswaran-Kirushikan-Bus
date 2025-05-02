export interface Route {
  start: string;
  end: string;
}

export interface Bus {
  id: string;
  name: string;
  type: 'Luxury' | 'Semi-Luxury' | 'Normal';
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
}

export interface Seat {
  number: number;
  price: number; // Price might vary per seat in some systems
}

export interface Ticket {
  id: string;
  userName: string;
  nic: string;
  startPoint: string;
  endPoint: string;
  busName: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  seatNumbers: number[];
  totalPrice: number;
  bookingDate: Date;
}

export interface UserProfile {
  id: string; // Typically corresponds to Firebase Auth UID or similar
  userName: string;
  nic: string;
  email: string;
  phoneNumber: string;
  // password hash is usually stored securely, not directly on the profile object in frontend context
}

