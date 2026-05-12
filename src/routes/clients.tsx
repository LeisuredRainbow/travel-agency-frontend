import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { ClientsCreateCard } from '#/features/clients/clients-create-card'
import { createClientsTableColumns } from '#/features/clients/clients-table-columns'
import { PaginatedTableCard } from '#/features/shared/paginated-table-card'
import { useClientsPageModel } from '#/features/clients/use-clients-page-model'
import { PageHeaderSection } from '#/features/shared/page-header-section'
import { FilterPanel } from '#/features/shared/filter-panel'

export function ClientsPage() {
  const model = useClientsPageModel({
    onSuccess: (msg) => toast.success(msg),
    onError: (msg) => toast.error(msg),
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const columns = useMemo(
    () => createClientsTableColumns({
      isDeletePending: model.remove.isPending,
      onDelete: model.remove.onDelete,
      onEdit: (client) => {
        model.form.startEdit(client)
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
      <PageHeaderSection title="Clients" />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
          Filters
        </Button>
        <Button size="sm" onClick={handleCreateNew}>Create Client</Button>
      </div>

      {filterOpen && (
        <FilterPanel
          fields={[
            { key: 'name', label: 'Name', value: model.filters.values.name, onChange: (v) => model.filters.updateFilter('name', v) },
            { key: 'email', label: 'Email', value: model.filters.values.email, onChange: (v) => model.filters.updateFilter('email', v), type: 'email' },
            { key: 'phone', label: 'Phone', value: model.filters.values.phone, onChange: (v) => model.filters.updateFilter('phone', v) },
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
            <DialogTitle>{model.form.editingId ? 'Edit Client' : 'New Client'}</DialogTitle>
          </DialogHeader>
          <ClientsCreateCard
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