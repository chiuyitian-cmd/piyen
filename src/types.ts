export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  reservationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  tableNumber: number;
  specialRequests: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string; // ISO string or timestamp string
  updatedAt: string; // ISO string or timestamp string
}

export interface TableConfig {
  number: number;
  capacity: number;
  description: string;
}

export interface WarmMessage {
  type: 'praise' | 'sarcasm';
  text: string;
  foodPun?: string;
  chefQuote?: string;
  bookingDetails?: {
    date: string;
    time: string;
    partySize: number;
    tableNumber: number;
    reservationId?: string;
  };
}
