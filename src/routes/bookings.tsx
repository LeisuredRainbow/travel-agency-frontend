import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { BookingsConfirmCard } from '#/features/bookings/bookings-confirm-card'
import { BookingsCreateCard } from '#/features/bookings/bookings-create-card'
import { createBookingsTableColumns } from '#/features/bookings/bookings-table-columns'
import { BookingsTableCard } from '#/features/bookings/bookings-table-card'
import { useBookingsPageModel } from '#/features/bookings/use-bookings-page-model'
import { PageHeaderSection } from '#/features/shared/page-header-section'
import { FilterPanel } from '#/features/shared/filter-panel'

export function BookingsPage() {
  const model = useBookingsPageModel({
    onSuccess: (msg) => toast.success(msg),
    onError: (msg) => toast.error(msg),
  })
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const columns = useMemo(
    () => createBookingsTableColumns({
      isDeletePending: model.remove.isPending,
      onDelete: model.remove.onDelete,
      onEdit: (booking) => {
        model.form.startEdit(booking)
        setIsCreateOpen(true)
      },
      toursMap: model.lookups.tours,
      clientsMap: model.lookups.clients,
    }),
    [model.remove.isPending, model.remove.onDelete, model.form.startEdit, model.lookups.tours, model.lookups.clients],
  )

  const handleCreateNew = () => {
    model.form.cancelEdit()
    setIsCreateOpen(true)
  }

  return (
    <div className="space-y-4">
      <PageHeaderSection title="Bookings" />

      <BookingsConfirmCard
        pendingBookings={model.pendingBookings}
        onSuccess={(msg) => toast.success(msg)}
        onError={(msg) => toast.error(msg)}
      />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
          Filters
        </Button>
        <Button size="sm" onClick={handleCreateNew}>Create Booking</Button>
      </div>

      {filterOpen && (
        <FilterPanel
          fields={[
            { key: 'tourName', label: 'Tour name', value: model.filters.values.tourName, onChange: (v) => model.filters.updateFilter('tourName', v) },
            { key: 'clientName', label: 'Client name', value: model.filters.values.clientName, onChange: (v) => model.filters.updateFilter('clientName', v) },
            { key: 'minDate', label: 'Min date', value: model.filters.values.minDate, onChange: (v) => model.filters.updateFilter('minDate', v), type: 'date' },
            { key: 'maxDate', label: 'Max date', value: model.filters.values.maxDate, onChange: (v) => model.filters.updateFilter('maxDate', v), type: 'date' },
            {
              key: 'status',
              label: 'Status',
              value: model.filters.values.status,
              onChange: (v) => model.filters.updateFilter('status', v),
              type: 'select',
              options: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            },
          ]}
          onApply={() => {
            model.filters.applyFilters()
            setFilterOpen(false)
          }}
          onClear={() => {
            model.filters.clearFilters()
            setFilterOpen(false)
          }}
          onValidationError={(msg) => toast.error(msg)}
        />
      )}

      <BookingsTableCard
        columns={columns}
        data={model.table.rows}
        errorMessage={model.table.errorMessage}
        page={model.table.page}
        totalPages={model.table.totalPages}
        canPrev={model.table.canPrev}
        canNext={model.table.canNext}
        onPrev={() => model.table.setPage((p) => Math.max(0, p - 1))}
        onNext={() => model.table.setPage((p) => p + 1)}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{model.form.editingId ? 'Edit Booking' : 'Create Booking'}</DialogTitle>
          </DialogHeader>
          <BookingsCreateCard
            items={model.form.items}
            onUpdateRow={model.form.updateRow}
            onAddRow={model.form.addRow}
            onRemoveRow={model.form.removeRow}
            onSave={() => {
              model.form.onSave()
              setIsCreateOpen(false)
            }}
            isPending={model.form.isPending}
            editingId={model.form.editingId}
            onCancelEdit={() => {
              model.form.cancelEdit()
              setIsCreateOpen(false)
            }}
            toursMap={model.lookups.tours}
            clientsMap={model.lookups.clients}
            isLoading={model.lookups.isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}