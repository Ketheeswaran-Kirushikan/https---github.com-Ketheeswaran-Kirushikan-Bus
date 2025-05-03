export interface Booking {
  _id?: string;
  userId: string;
  busId: string;
  routeId: string;
  seatNumbers: string[];
  date: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt?: Date;
}