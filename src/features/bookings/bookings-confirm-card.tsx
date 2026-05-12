import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { travelRequest } from '#/lib/travel/travel-request'
import { queryKeys } from '#/lib/travel/query-keys'

interface PendingBooking {
  id: number
  tourName: string
  clientName: string
}

interface BookingsConfirmCardProps {
  pendingBookings: PendingBooking[]
  onSuccess?: (msg: string) => void
  onError?: (msg: string) => void
}

export function BookingsConfirmCard({ pendingBookings, onSuccess, onError }: BookingsConfirmCardProps) {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  const startMutation = useMutation({
    mutationFn: () =>
      travelRequest<{ taskId: string }>({
        path: `/async/confirm?bookingId=${selectedId}`,
        method: 'POST',
      }),
    onSuccess: (data) => {
      setTaskId(data.taskId)
      setStatus('PENDING')
      setStatusMessage('Task started')
      onSuccess?.('Confirmation started')
      pollStatus(data.taskId)
    },
    onError: (error: Error) => onError?.(error.message || 'Failed to start confirmation'),
  })

  const pollStatus = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await travelRequest<{ status: string; message?: string }>({
          path: `/async/confirm/${taskId}`,
        })
        setStatus(res.status)
        setStatusMessage(res.message || '')
        if (res.status === 'SUCCESS' || res.status === 'FAILED') {
          clearInterval(interval)
          queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
          onSuccess?.(`Task ${res.status.toLowerCase()}`)
        }
      } catch {
        clearInterval(interval)
        onError?.('Status check failed')
      }
    }, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="space-y-1 flex-1">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pending booking" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground max-h-40 overflow-y-auto">
                {pendingBookings.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.tourName} – {b.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending || !selectedId}
          >
            {startMutation.isPending ? 'Starting...' : 'Confirm'}
          </Button>
        </div>
        {taskId && (
          <div className="mt-4 text-sm space-y-1">
            <p>
              <span className="font-medium">Task ID:</span> {taskId}
            </p>
            {status && (
              <p>
                <span className="font-medium">Status:</span> {status}
                {statusMessage && ` – ${statusMessage}`}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}