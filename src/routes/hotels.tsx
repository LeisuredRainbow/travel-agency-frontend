import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { HotelsCreateCard } from '#/features/hotels/hotels-create-card'
import { createHotelsTableColumns } from '#/features/hotels/hotels-table-columns'
import { PaginatedTableCard } from '#/features/shared/paginated-table-card'
import { useHotelsPageModel } from '#/features/hotels/use-hotels-page-model'
import { PageHeaderSection } from '#/features/shared/page-header-section'
import { FilterPanel } from '#/features/shared/filter-panel'
import { StarFilter } from '#/features/shared/star-filter'

export function HotelsPage() {
  const model = useHotelsPageModel({
    onSuccess: (msg) => toast.success(msg),
    onError: (msg) => toast.error(msg),
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const columns = useMemo(
    () => createHotelsTableColumns({
      isDeletePending: model.remove.isPending,
      onDelete: model.remove.onDelete,
      onEdit: (hotel) => {
        model.form.startEdit(hotel)
        setIsDialogOpen(true)
      },
    }),
    [model.remove.isPending, model.remove.onDelete, model.form.startEdit],
  )

  const handleCreateNew = () => {
    model.form.cancelEdit()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <PageHeaderSection title="Hotels" />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
          Filters
        </Button>
        <Button size="sm" onClick={handleCreateNew}>Create Hotel</Button>
      </div>

      {filterOpen && (
        <FilterPanel
          fields={[
            { key: 'name', label: 'Name', value: model.filters.values.name, onChange: (v) => model.filters.updateFilter('name', v) },
            { key: 'address', label: 'Address', value: model.filters.values.address, onChange: (v) => model.filters.updateFilter('address', v) },
            {
              key: 'minStars',
              label: 'Min stars',
              value: model.filters.values.minStars,
              onChange: (v) => model.filters.updateFilter('minStars', v),
              render: (props) => <StarFilter value={props.value} onChange={props.onChange} />,
            },
            {
              key: 'maxStars',
              label: 'Max stars',
              value: model.filters.values.maxStars,
              onChange: (v) => model.filters.updateFilter('maxStars', v),
              render: (props) => <StarFilter value={props.value} onChange={props.onChange} />,
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

      <PaginatedTableCard
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{model.form.editingId ? 'Edit Hotel' : 'New Hotel'}</DialogTitle>
          </DialogHeader>
          <HotelsCreateCard
            value={model.form.data}
            onChange={model.form.setData}
            onApply={() => {
              model.form.onSave()
              setIsDialogOpen(false)
            }}
            isPending={model.form.isPending}
            editingId={model.form.editingId}
            onCancelEdit={() => {
              model.form.cancelEdit()
              setIsDialogOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}