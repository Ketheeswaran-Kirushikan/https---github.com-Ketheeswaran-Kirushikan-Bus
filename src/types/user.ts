export interface User {
    _id?: string; // MongoDB will handle ObjectId conversion
    id: string; // UUID for application-level identification
    userName: string;
    nic: string;
    email: string;
    phoneNumber: string;
    password: string;
    createdAt?: Date;
  }