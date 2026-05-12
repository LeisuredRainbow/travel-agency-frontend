import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClients, createClient, updateClient, deleteClient } from '#/lib/travel/functions/clients.functions'
import type { ClientRequest, ClientResponse } from '#/lib/travel/schemas'
import { queryKeys } from '#/lib/travel/query-keys'

interface Notifications {
  onSuccess?: (msg: string) => void
  onError?: (msg: string) => void
}

interface ClientFilters {
  name: string
  email: string
  phone: string
}

const initialFilters: ClientFilters = {
  name: '',
  email: '',
  phone: '',
}

export function useClientsPageModel(notifications?: Notifications) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ClientRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filters, setFilters] = useState<ClientFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<ClientFilters>(initialFilters)
  const [page, setPage] = useState(0)
  const pageSize = 5

  const query = useQuery({
    queryKey: queryKeys.clients,
    queryFn: fetchClients,
  })

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      notifications?.onSuccess?.('Client created')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to create client')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientRequest> }) =>
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      notifications?.onSuccess?.('Client updated')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to update client')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      notifications?.onSuccess?.('Client deleted')
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to delete client')
    },
  })

  const handleSave = () => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (client: ClientRequest & { id: number }) => {
    setEditingId(client.id)
    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone ?? '',
      email: client.email,
    })
  }

  const cancelEdit = () => resetForm()
  const resetForm = () => {
    setEditingId(null)
    setForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    })
  }

  const updateFilter = (key: keyof ClientFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setAppliedFilters({ ...filters })
    setPage(0)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setPage(0)
  }

  const filteredRows = useMemo(() => {
    let rows = query.data ?? []

    if (appliedFilters.name) {
      const val = appliedFilters.name.toLowerCase()
      rows = rows.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
        return fullName.includes(val)
      })
    }
    if (appliedFilters.email) {
      rows = rows.filter((c) => c.email.toLowerCase().includes(appliedFilters.email.toLowerCase()))
    }
    if (appliedFilters.phone) {
      rows = rows.filter((c) => c.phone?.includes(appliedFilters.phone))
    }

    return rows
  }, [query.data, appliedFilters])

  const totalPages = Math.ceil(filteredRows.length / pageSize)

  const safePage = useMemo(() => {
    if (totalPages === 0) return 0
    return Math.min(page, totalPages - 1)
  }, [page, totalPages])

  const paginatedRows = useMemo(() => {
    const start = safePage * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safePage])

  return {
    table: {
      rows: paginatedRows as ClientResponse[],
      errorMessage: query.error ? `Failed to load clients: ${query.error.message}` : null,
      page: safePage,
      setPage: (updater: number | ((prev: number) => number)) => {
        setPage((prev) => {
          const next = typeof updater === 'function' ? (updater as (prev: number) => number)(prev) : updater
          if (totalPages === 0) return 0
          return Math.min(next, totalPages - 1)
        })
      },
      totalPages,
      canPrev: safePage > 0,
      canNext: safePage < totalPages - 1,
    },
    form: {
      data: form,
      setData: setForm,
      editingId,
      isPending: editingId !== null ? updateMutation.isPending : createMutation.isPending,
      onSave: handleSave,
      startEdit,
      cancelEdit,
    },
    remove: {
      onDelete: (id: number) => deleteMutation.mutate(id),
      isPending: deleteMutation.isPending,
    },
    filters: {
      values: filters,
      updateFilter,
      applyFilters,
      clearFilters,
    },
  }
}