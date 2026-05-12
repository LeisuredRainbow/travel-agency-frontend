import { travelRequest } from '../travel-request'
import type { TourResponse, TourRequest } from '../schemas'

export const fetchTours = () => travelRequest<TourResponse[]>({ path: '/api/tours' })

export const createTour = (data: TourRequest) =>
  travelRequest<TourResponse>({ path: '/api/tours', method: 'POST', body: data })

export const updateTour = (id: number, data: Partial<TourRequest>) =>
  travelRequest<TourResponse>({ path: `/api/tours/${id}`, method: 'PUT', body: data })

export const deleteTour = (id: number) =>
  travelRequest<void>({ path: `/api/tours/${id}`, method: 'DELETE' })