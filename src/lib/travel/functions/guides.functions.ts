import { travelRequest } from '../travel-request'
import type { GuideResponse, GuideRequest } from '../schemas'

export const fetchGuides = () => travelRequest<GuideResponse[]>({ path: '/api/guides' })
export const createGuide = (data: GuideRequest) =>
  travelRequest<GuideResponse>({ path: '/api/guides', method: 'POST', body: data })
export const updateGuide = (id: number, data: Partial<GuideRequest>) =>
  travelRequest<GuideResponse>({ path: `/api/guides/${id}`, method: 'PUT', body: data })
export const deleteGuide = (id: number) =>
  travelRequest<void>({ path: `/api/guides/${id}`, method: 'DELETE' })