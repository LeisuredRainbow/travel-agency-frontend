import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '#/components/ui/button'
import { ConfirmDialogButton } from '#/components/ui/confirm-dialog-button'
import { TourNameTooltip } from './tour-name-tooltip'
import type { TourResponse, HotelResponse, GuideResponse } from '#/lib/travel/schemas'

interface Options {
  isDeletePending: boolean
  onDelete: (id: number) => void
  onEdit: (tour: TourResponse) => void
  hotels: HotelResponse[]
  guides: GuideResponse[]
}

export function createToursTableColumns({
  isDeletePending,
  onDelete,
  onEdit,
  hotels,
  guides,
}: Options): ColumnDef<TourResponse>[] {
  const hotelsMap = useMemo(() => {
    const map = new Map<number, HotelResponse>()
    hotels.forEach((h) => map.set(h.id, h))
    return map
  }, [hotels])

  const guidesMap = useMemo(() => {
    const map = new Map<number, GuideResponse>()
    guides.forEach((g) => map.set(g.id, g))
    return map
  }, [guides])

  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <TourNameTooltip
          name={row.original.name}
          hotelIds={row.original.hotelIds}
          guideIds={row.original.guideIds}
          hotelsMap={hotelsMap}
          guidesMap={guidesMap}
        />
      ),
    },
    { accessorKey: 'country', header: 'Country' },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => `$${row.original.price}`,
    },
    { accessorKey: 'durationDays', header: 'Duration' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'hot',
      header: 'Hot',
      cell: ({ row }) => (row.original.hot ? '🔥' : '❄️'),
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
            title="Delete Tour"
            description="Are you sure you want to delete this tour?"
            confirmLabel="Delete"
            isPending={isDeletePending}
            onConfirm={() => onDelete(row.original.id)}
          />
        </div>
      ),
    },
  ]
}