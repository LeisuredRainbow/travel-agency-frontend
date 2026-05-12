import { travelRequest } from '../travel-request'
import type { BookingResponse, BookingRequest } from '../schemas'

export const fetchBookings = () => travelRequest<BookingResponse[]>({ path: '/api/bookings' })
export const createBooking = (data: BookingRequest) =>
  travelRequest<BookingResponse>({ path: '/api/bookings', method: 'POST', body: data })
export const updateBooking = (id: number, data: Partial<BookingRequest>) =>
  travelRequest<BookingResponse>({ path: `/api/bookings/${id}`, method: 'PUT', body: data })
export const deleteBooking = (id: number) =>
  travelRequest({ path: `/api/bookings/${id}`, method: 'DELETE' })