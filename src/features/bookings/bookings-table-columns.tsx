import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '#/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { ConfirmDialogButton } from '#/components/ui/confirm-dialog-button'
import type { BookingResponse, ClientResponse, TourResponse } from '#/lib/travel/schemas'

interface Options {
  isDeletePending: boolean
  onDelete: (id: number) => void
  onEdit: (booking: BookingResponse) => void
  toursMap: Map<number, TourResponse>
  clientsMap: Map<number, ClientResponse>
}

export function createBookingsTableColumns({ isDeletePending, onDelete, onEdit, toursMap, clientsMap }: Options): ColumnDef<BookingResponse>[] {
  return [
    {
      accessorKey: 'tourId',
      header: 'Tour',
      cell: ({ row }) => {
        const tour = toursMap.get(row.original.tourId)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted">
                {tour?.name ?? `#${row.original.tourId}`}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {tour ? (
                <div className="text-xs space-y-1">
                  <p className="font-semibold">{tour.name}</p>
                  <p>{tour.country}</p>
                  <p>Price: ${tour.price}</p>
                  <p>Duration: {tour.durationDays ?? '—'} days</p>
                  {tour.description && <p>{tour.description}</p>}
                </div>
              ) : (
                <span>Tour not found</span>
              )}
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: 'clientId',
      header: 'Client',
      cell: ({ row }) => {
        const client = clientsMap.get(row.original.clientId)
        const fullName = client ? `${client.firstName} ${client.lastName}` : `#${row.original.clientId}`
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted">
                {fullName}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {client ? (
                <div className="text-xs space-y-1">
                  <p className="font-semibold">{client.firstName} {client.lastName}</p>
                  <p>{client.email}</p>
                  {client.phone && <p>{client.phone}</p>}
                </div>
              ) : (
                <span>Client not found</span>
              )}
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    { accessorKey: 'bookingDate', header: 'Date' },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
            Edit
          </Button>
          <ConfirmDialogButton
            triggerLabel="Delete"
            triggerVariant="destructive"
            triggerSize="sm"
            title="Delete Booking"
            description="Are you sure you want to delete this booking?"
            confirmLabel="Delete"
            isPending={isDeletePending}
            onConfirm={() => onDelete(row.original.id)}
          />
        </div>
      ),
    },
  ]
}