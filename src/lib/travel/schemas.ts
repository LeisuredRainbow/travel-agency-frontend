import { z } from 'zod'

export const TourResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  country: z.string(),
  price: z.number(),
  durationDays: z.number().int().optional(),
  description: z.string().optional(),
  hot: z.boolean().optional(),
  hotelIds: z.array(z.number().int()).default([]),
  guideIds: z.array(z.number().int()).default([]),
})

export const TourRequestSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  price: z.number().positive(),
  durationDays: z.number().int().positive().optional(),
  description: z.string().optional(),
  hot: z.boolean().optional(),
  hotelIds: z.array(z.number().int().positive()).optional(),
  guideIds: z.array(z.number().int().positive()).optional(),
})

export type TourResponse = z.infer<typeof TourResponseSchema>
export type TourRequest = z.infer<typeof TourRequestSchema>

export const HotelResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  address: z.string().optional(),
  stars: z.number().int().min(1).max(5).optional(),
})

export const HotelRequestSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  stars: z.number().int().min(1).max(5).optional(),
})

export type HotelResponse = z.infer<typeof HotelResponseSchema>
export type HotelRequest = z.infer<typeof HotelRequestSchema>

export const GuideResponseSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  email: z.string(),
  experienceYears: z.number().int().optional(),
})

export const GuideRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email(),
  experienceYears: z.number().int().min(0).optional(),
})

export type GuideResponse = z.infer<typeof GuideResponseSchema>
export type GuideRequest = z.infer<typeof GuideRequestSchema>

export const ClientResponseSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
})

export const ClientRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
})

export type ClientResponse = z.infer<typeof ClientResponseSchema>
export type ClientRequest = z.infer<typeof ClientRequestSchema>

export const BookingResponseSchema = z.object({
  id: z.number().int(),
  clientId: z.number().int(),
  tourId: z.number().int(),
  bookingDate: z.string(),
  status: z.enum(['CONFIRMED', 'PENDING', 'CANCELLED']),
})

export const BookingRequestSchema = z.object({
  clientId: z.number().int().positive(),
  tourId: z.number().int().positive(),
  bookingDate: z.string().min(1),
  status: z.enum(['CONFIRMED', 'PENDING', 'CANCELLED']),
})

export type BookingResponse = z.infer<typeof BookingResponseSchema>
export type BookingRequest = z.infer<typeof BookingRequestSchema>