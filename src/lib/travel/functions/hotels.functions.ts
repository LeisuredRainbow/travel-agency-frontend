import { travelRequest } from '../travel-request'
import type { HotelResponse, HotelRequest } from '../schemas'

export const fetchHotels = () => travelRequest<HotelResponse[]>({ path: '/api/hotels' })
export const createHotel = (data: HotelRequest) =>
  travelRequest<HotelResponse>({ path: '/api/hotels', method: 'POST', body: data })
export const updateHotel = (id: number, data: Partial<HotelRequest>) =>
  travelRequest<HotelResponse>({ path: `/api/hotels/${id}`, method: 'PUT', body: data })
export const deleteHotel = (id: number) =>
  travelRequest<void>({ path: `/api/hotels/${id}`, method: 'DELETE' })