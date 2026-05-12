export interface Tour {
  id: number;
  name: string;
  country: string;
  durationDays?: number;
  price: number;
  hot?: boolean;
  description?: string;
  hotelIds: number[];
  guideIds: number[];
}

export interface Hotel {
  id: number;
  name: string;
  address?: string;
  stars?: number;
}

export interface Guide {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  experienceYears?: number;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Booking {
  id: number;
  clientId: number;
  tourId: number;
  bookingDate: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

export interface AsyncTaskStatus {
  taskId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  message?: string;
}

export interface AsyncTaskMetrics {
  submitted: number;
  running: number;
  succeeded: number;
  failed: number;
}