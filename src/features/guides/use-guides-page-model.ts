import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchGuides, createGuide, updateGuide, deleteGuide } from '#/lib/travel/functions/guides.functions'
import type { GuideRequest, GuideResponse } from '#/lib/travel/schemas'
import { queryKeys } from '#/lib/travel/query-keys'

interface Notifications {
  onSuccess?: (msg: string) => void
  onError?: (msg: string) => void
}

interface GuideFilters {
  name: string
  email: string
  phone: string
  experience: string
}

const initialFilters: GuideFilters = {
  name: '',
  email: '',
  phone: '',
  experience: '',
}

export function useGuidesPageModel(notifications?: Notifications) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<GuideRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    experienceYears: 0,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filters, setFilters] = useState<GuideFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<GuideFilters>(initialFilters)
  const [page, setPage] = useState(0)
  const pageSize = 5

  const query = useQuery({
    queryKey: queryKeys.guides,
    queryFn: fetchGuides,
  })

  const createMutation = useMutation({
    mutationFn: createGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides })
      notifications?.onSuccess?.('Guide created')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to create guide')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GuideRequest> }) =>
      updateGuide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides })
      notifications?.onSuccess?.('Guide updated')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to update guide')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guides })
      notifications?.onSuccess?.('Guide deleted')
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to delete guide')
    },
  })

  const handleSave = () => {
    if (editingId !== null) {
      const payload = { ...form }
      if (payload.experienceYears === 0) {
        payload.experienceYears = undefined
      }
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (guide: GuideRequest & { id: number }) => {
    setEditingId(guide.id)
    setForm({
      firstName: guide.firstName,
      lastName: guide.lastName,
      phone: guide.phone ?? '',
      email: guide.email,
      experienceYears: guide.experienceYears ?? 0,
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
      experienceYears: 0,
    })
  }

  const updateFilter = (key: keyof GuideFilters, value: string) => {
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
      rows = rows.filter((g) => {
        const fullName = `${g.firstName} ${g.lastName}`.toLowerCase()
        return fullName.includes(val)
      })
    }
    if (appliedFilters.email) {
      rows = rows.filter((g) => g.email.toLowerCase().includes(appliedFilters.email.toLowerCase()))
    }
    if (appliedFilters.phone) {
      rows = rows.filter((g) => g.phone?.includes(appliedFilters.phone))
    }
    const exp = parseInt(appliedFilters.experience)
    if (!isNaN(exp)) {
      rows = rows.filter((g) => (g.experienceYears ?? 0) >= exp)
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
      rows: paginatedRows as GuideResponse[],
      errorMessage: query.error ? `Failed to load guides: ${query.error.message}` : null,
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