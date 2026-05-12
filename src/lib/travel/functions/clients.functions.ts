import { travelRequest } from '../travel-request'
import type { ClientResponse, ClientRequest } from '../schemas'

export const fetchClients = () => travelRequest<ClientResponse[]>({ path: '/api/clients' })
export const createClient = (data: ClientRequest) =>
  travelRequest<ClientResponse>({ path: '/api/clients', method: 'POST', body: data })
export const updateClient = (id: number, data: Partial<ClientRequest>) =>
  travelRequest<ClientResponse>({ path: `/api/clients/${id}`, method: 'PUT', body: data })
export const deleteClient = (id: number) =>
  travelRequest({ path: `/api/clients/${id}`, method: 'DELETE' })