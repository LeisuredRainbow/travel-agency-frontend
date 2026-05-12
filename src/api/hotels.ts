import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Hotel } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchHotels(): Promise<Hotel[]> {
  const res = await fetch(`${API_BASE}/api/hotels`);
  if (!res.ok) throw new Error('Failed to fetch hotels');
  return res.json();
}

async function createHotel(data: Omit<Hotel, 'id'>) {
  const res = await fetch(`${API_BASE}/api/hotels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create hotel');
  return res.json();
}

async function updateHotel(id: number, data: Partial<Hotel>) {
  const res = await fetch(`${API_BASE}/api/hotels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update hotel');
  return res.json();
}

async function deleteHotel(id: number) {
  const res = await fetch(`${API_BASE}/api/hotels/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete hotel');
}

export function useHotels() {
  return useQuery<Hotel[]>({ queryKey: ['hotels'], queryFn: fetchHotels });
}

export function useCreateHotel() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createHotel, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels'] }) });
}

export function useUpdateHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Hotel> }) => updateHotel(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels'] }),
  });
}

export function useDeleteHotel() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteHotel, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hotels'] }) });
}