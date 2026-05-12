import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { ToursCreateCard } from '#/features/tours/tours-create-card'
import { createToursTableColumns } from '#/features/tours/tours-table-columns'
import { PaginatedTableCard } from '#/features/shared/paginated-table-card'
import { useToursPageModel } from '#/features/tours/use-tours-page-model'
import { PageHeaderSection } from '#/features/shared/page-header-section'
import { FilterPanel } from '#/features/shared/filter-panel'
import { useQuery } from '@tanstack/react-query'
import { fetchHotels } from '#/lib/travel/functions/hotels.functions'
import { fetchGuides } from '#/lib/travel/functions/guides.functions'

export function ToursPage() {
  const model = useToursPageModel({
    onSuccess: (msg) => toast.success(msg),
    onError: (msg) => toast.error(msg),
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const hotelsQuery = useQuery({ queryKey: ['hotels'], queryFn: fetchHotels })
  const guidesQuery = useQuery({ queryKey: ['guides'], queryFn: fetchGuides })

  const columns = useMemo(
    () => createToursTableColumns({
      isDeletePending: model.remove.isPending,
      onDelete: model.remove.onDelete,
      onEdit: (tour) => {
        model.form.startEdit(tour)
        setIsDialogOpen(true)
      },
      hotels: hotelsQuery.data ?? [],
      guides: guidesQuery.data ?? [],
    }),
    [model.remove.isPending, model.remove.onDelete, model.form.startEdit, hotelsQuery.data, guidesQuery.data],
  )

  const handleCreateNew = () => {
    model.form.cancelEdit()
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <PageHeaderSection title="Tours" />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
          Filters
        </Button>
        <Button size="sm" onClick={handleCreateNew}>Create Tour</Button>
      </div>

      {filterOpen && (
        <FilterPanel
          fields={[
            { key: 'name', label: 'Name', value: model.filters.values.name, onChange: (v) => model.filters.updateFilter('name', v) },
            { key: 'country', label: 'Country', value: model.filters.values.country, onChange: (v) => model.filters.updateFilter('country', v) },
            { key: 'minPrice', label: 'Min price', value: model.filters.values.minPrice, onChange: (v) => model.filters.updateFilter('minPrice', v), type: 'number' },
            { key: 'maxPrice', label: 'Max price', value: model.filters.values.maxPrice, onChange: (v) => model.filters.updateFilter('maxPrice', v), type: 'number' },
            {
              key: 'hot',
              label: 'Hot',
              value: model.filters.values.hot,
              onChange: (v) => model.filters.updateFilter('hot', v),
              type: 'select',
              options: ['true', 'false'],
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
            <DialogTitle>{model.form.editingId ? 'Edit Tour' : 'New Tour'}</DialogTitle>
          </DialogHeader>
          <ToursCreateCard
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
            hotels={hotelsQuery.data ?? []}
            guides={guidesQuery.data ?? []}
            hotelsLoading={hotelsQuery.isLoading}
            guidesLoading={guidesQuery.isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}