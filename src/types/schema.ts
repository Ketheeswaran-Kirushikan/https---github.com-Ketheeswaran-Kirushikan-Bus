export interface Route {
  start: string;
  end: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Bus {
  id: string;
  name: string;
  type: 'Luxury' | 'Semi-Luxury' | 'Normal';
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  startPoint: string;
  endPoint: string;
  seats?: Seat[];
}

export interface Seat {
  number: number;
  price: number;
  isAvailable?: boolean;
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
  route: Route; // Added to include the full route object
}

export interface UserProfile {
  id: string;
  userName: string;
  nic: string;
  email: string;
  phoneNumber: string;
}