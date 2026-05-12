import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '#/components/ui/button'
import { ConfirmDialogButton } from '#/components/ui/confirm-dialog-button'
import type { GuideResponse } from '#/lib/travel/schemas'

interface Options {
  isDeletePending: boolean
  onDelete: (id: number) => void
  onEdit: (guide: GuideResponse) => void
}

export function createGuidesTableColumns({ isDeletePending, onDelete, onEdit }: Options): ColumnDef<GuideResponse>[] {
  return [
    { accessorKey: 'firstName', header: 'First Name' },
    { accessorKey: 'lastName', header: 'Last Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'experienceYears', header: 'Experience' },
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
            title="Delete Guide"
            description="Are you sure you want to delete this guide?"
            confirmLabel="Delete"
            isPending={isDeletePending}
            onConfirm={() => onDelete(row.original.id)}
          />
        </div>
      ),
    },
  ]
}