import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/api/bookings`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

async function createBooking(data: Omit<Booking, 'id'>) {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

async function updateBooking(id: number, data: Partial<Booking>) {
  const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update booking');
  return res.json();
}

async function deleteBooking(id: number) {
  const res = await fetch(`${API_BASE}/api/bookings/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete booking');
}

export function useBookings() {
  return useQuery<Booking[]>({ queryKey: ['bookings'], queryFn: fetchBookings });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Booking> }) => updateBooking(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}