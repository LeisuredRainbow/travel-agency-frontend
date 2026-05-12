export const queryKeys = {
  tours: ['tours'] as const,
  hotels: ['hotels'] as const,
  guides: ['guides'] as const,
  clients: ['clients'] as const,
  bookings: ['bookings'] as const,
  asyncConfirm: (taskId?: string) => ['async', 'confirm', taskId] as const,
}