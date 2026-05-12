import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { BookingRequest } from '#/lib/travel/schemas'

interface Props {
  items: BookingRequest[]
  onUpdateRow: (index: number, patch: Partial<BookingRequest>) => void
  onAddRow: () => void
  onRemoveRow: (index: number) => void
  onSave: () => void
  isPending: boolean
  editingId: number | null
  onCancelEdit: () => void
  toursMap: Map<number, { name: string }>
  clientsMap: Map<number, { firstName: string; lastName: string }>
  isLoading: boolean
}

export function BookingsCreateCard({
  items,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onSave,
  isPending,
  editingId,
  onCancelEdit,
  toursMap,
  clientsMap,
  isLoading,
}: Props) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const isRowValid = (item: BookingRequest) => {
    return (
      item.clientId > 0 &&
      item.tourId > 0 &&
      item.bookingDate.trim() !== '' &&
      item.status !== undefined
    )
  }

  const allRowsValid = items.every(isRowValid)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? 'Edit Booking' : 'Create Booking'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`${editingId ? '' : 'max-h-96 overflow-y-auto'} space-y-4 pr-2`}>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 items-end border-b border-(--line) pb-3">
              <div className="space-y-1">
                <Label>Client</Label>
                {isLoading ? (
                  <Input disabled value="Loading..." />
                ) : (
                  <Select
                    value={item.clientId ? String(item.clientId) : ''}
                    onValueChange={(v) => onUpdateRow(index, { clientId: Number(v) })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground max-h-40 overflow-y-auto">
                      {Array.from(clientsMap.entries()).map(([id, c]) => (
                        <SelectItem key={id} value={String(id)}>
                          {c.firstName} {c.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1">
                <Label>Tour</Label>
                {isLoading ? (
                  <Input disabled value="Loading..." />
                ) : (
                  <Select
                    value={item.tourId ? String(item.tourId) : ''}
                    onValueChange={(v) => onUpdateRow(index, { tourId: Number(v) })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tour" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground max-h-40 overflow-y-auto">
                      {Array.from(toursMap.entries()).map(([id, t]) => (
                        <SelectItem key={id} value={String(id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`bookingDate-${index}`}>Booking Date</Label>
                <Input
                  id={`bookingDate-${index}`}
                  type="date"
                  lang="en"
                  min={minDate}
                  value={item.bookingDate}
                  onChange={(e) => onUpdateRow(index, { bookingDate: e.target.value })}
                  required
                  className="w-full"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={item.status}
                  onValueChange={(v) => onUpdateRow(index, { status: v as BookingRequest['status'] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingId === null && items.length > 1 && (
                <div className="flex justify-end">
                  <Button variant="destructive" size="icon" onClick={() => onRemoveRow(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {editingId === null && (
          <Button variant="outline" className="w-full" onClick={onAddRow}>
            <Plus className="h-4 w-4 mr-1" /> Add Booking
          </Button>
        )}

        <div className="flex gap-2">
          <Button onClick={onSave} disabled={isPending || !allRowsValid}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}