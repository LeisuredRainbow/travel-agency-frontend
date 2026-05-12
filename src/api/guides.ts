import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Guide } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchGuides(): Promise<Guide[]> {
  const res = await fetch(`${API_BASE}/api/guides`);
  if (!res.ok) throw new Error('Failed to fetch guides');
  return res.json();
}

async function createGuide(data: Omit<Guide, 'id'>) {
  const res = await fetch(`${API_BASE}/api/guides`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create guide');
  return res.json();
}

async function updateGuide(id: number, data: Partial<Guide>) {
  const res = await fetch(`${API_BASE}/api/guides/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update guide');
  return res.json();
}

async function deleteGuide(id: number) {
  const res = await fetch(`${API_BASE}/api/guides/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete guide');
}

export function useGuides() {
  return useQuery<Guide[]>({ queryKey: ['guides'], queryFn: fetchGuides });
}

export function useCreateGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGuide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guides'] }),
  });
}

export function useUpdateGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Guide> }) => updateGuide(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guides'] }),
  });
}

export function useDeleteGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGuide,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guides'] }),
  });
}