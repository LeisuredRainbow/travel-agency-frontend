import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '#/components/ui/button'
import { ConfirmDialogButton } from '#/components/ui/confirm-dialog-button'
import type { HotelResponse } from '#/lib/travel/schemas'

interface Options {
  isDeletePending: boolean
  onDelete: (id: number) => void
  onEdit: (hotel: HotelResponse) => void
}

export function createHotelsTableColumns({ isDeletePending, onDelete, onEdit }: Options): ColumnDef<HotelResponse>[] {
  return [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'address', header: 'Address' },
    {
      accessorKey: 'stars',
      header: 'Stars',
      cell: ({ row }) => {
        const stars = row.original.stars ?? 0
        return '⭐'.repeat(stars) + '☆'.repeat(5 - stars)
      },
    },
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
            title="Delete Hotel"
            description="Are you sure you want to delete this hotel?"
            confirmLabel="Delete"
            isPending={isDeletePending}
            onConfirm={() => onDelete(row.original.id)}
          />
        </div>
      ),
    },
  ]
}