import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function fetchClients(): Promise<Client[]> {
  const res = await fetch(`${API_BASE}/api/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

async function createClient(data: Omit<Client, 'id'>) {
  const res = await fetch(`${API_BASE}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

async function updateClient(id: number, data: Partial<Client>) {
  const res = await fetch(`${API_BASE}/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update client');
  return res.json();
}

async function deleteClient(id: number) {
  const res = await fetch(`${API_BASE}/api/clients/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete client');
}

export function useClients() {
  return useQuery<Client[]>({ queryKey: ['clients'], queryFn: fetchClients });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createClient, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }) });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteClient, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }) });
}