import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tour } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchTours(): Promise<Tour[]> {
  const res = await fetch(`${API_BASE}/api/tours`);
  if (!res.ok) throw new Error('Failed to fetch tours');
  return res.json();
}

async function fetchTourById(id: number): Promise<Tour> {
  const res = await fetch(`${API_BASE}/api/tours/${id}`);
  if (!res.ok) throw new Error('Failed to fetch tour');
  return res.json();
}

async function createTour(data: Omit<Tour, 'id' | 'hotelIds' | 'guideIds'> & { hotelIds?: number[]; guideIds?: number[] }) {
  const res = await fetch(`${API_BASE}/api/tours`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create tour');
  return res.json();
}

async function updateTour(id: number, data: Partial<Tour>) {
  const res = await fetch(`${API_BASE}/api/tours/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update tour');
  return res.json();
}

async function deleteTour(id: number) {
  const res = await fetch(`${API_BASE}/api/tours/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete tour');
}

export function useTours() {
  return useQuery<Tour[]>({ queryKey: ['tours'], queryFn: fetchTours });
}

export function useTour(id: number) {
  return useQuery<Tour>({ queryKey: ['tours', id], queryFn: () => fetchTourById(id), enabled: !!id });
}

export function useCreateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTour,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tours'] }),
  });
}

export function useUpdateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tour> }) => updateTour(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tours'] }),
  });
}

export function useDeleteTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTour,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tours'] }),
  });
}