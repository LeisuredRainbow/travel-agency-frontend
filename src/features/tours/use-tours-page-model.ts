import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTours, createTour, updateTour, deleteTour } from '#/lib/travel/functions/tours.functions'
import type { TourRequest, TourResponse } from '#/lib/travel/schemas'
import { queryKeys } from '#/lib/travel/query-keys'

interface Notifications {
  onSuccess?: (msg: string) => void
  onError?: (msg: string) => void
}

interface TourFilters {
  name: string
  country: string
  minPrice: string
  maxPrice: string
  hot: string
}

const initialFilters: TourFilters = {
  name: '',
  country: '',
  minPrice: '',
  maxPrice: '',
  hot: '',
}

export function useToursPageModel(notifications?: Notifications) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<TourRequest>({
    name: '',
    country: '',
    price: 0,
    durationDays: 0,
    description: '',
    hotelIds: [],
    guideIds: [],
    hot: false,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filters, setFilters] = useState<TourFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<TourFilters>(initialFilters)
  const [page, setPage] = useState(0)
  const pageSize = 5

  const query = useQuery({
    queryKey: queryKeys.tours,
    queryFn: fetchTours,
  })

  const createMutation = useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tours })
      notifications?.onSuccess?.('Tour created')
      resetForm()
    },
    onError: (err) => {
      notifications?.onError?.(`Failed to create tour: ${err.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TourRequest> }) =>
      updateTour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tours })
      notifications?.onSuccess?.('Tour updated')
      resetForm()
    },
    onError: (err) => {
      notifications?.onError?.(`Failed to update tour: ${err.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tours })
      notifications?.onSuccess?.('Tour deleted')
    },
    onError: (err) => {
      notifications?.onError?.(`Failed to delete tour: ${err.message}`)
    },
  })

  const handleSave = () => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (tour: TourRequest & { id: number }) => {
    setEditingId(tour.id)
    setForm({
      name: tour.name,
      country: tour.country,
      price: tour.price,
      durationDays: tour.durationDays ?? 0,
      description: tour.description ?? '',
      hotelIds: tour.hotelIds ?? [],
      guideIds: tour.guideIds ?? [],
      hot: tour.hot ?? false,
    })
  }

  const cancelEdit = () => resetForm()
  const resetForm = () => {
    setEditingId(null)
    setForm({
      name: '',
      country: '',
      price: 0,
      durationDays: 0,
      description: '',
      hotelIds: [],
      guideIds: [],
      hot: false,
    })
  }

  const updateFilter = (key: keyof TourFilters, value: string) => {
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
      rows = rows.filter((t) => t.name.toLowerCase().includes(appliedFilters.name.toLowerCase()))
    }
    if (appliedFilters.country) {
      rows = rows.filter((t) => t.country.toLowerCase().includes(appliedFilters.country.toLowerCase()))
    }
    const minPrice = parseFloat(appliedFilters.minPrice)
    if (!isNaN(minPrice) && minPrice > 0) {
      rows = rows.filter((t) => t.price >= minPrice)
    }
    const maxPrice = parseFloat(appliedFilters.maxPrice)
    if (!isNaN(maxPrice) && maxPrice > 0) {
      rows = rows.filter((t) => t.price <= maxPrice)
    }
    if (appliedFilters.hot === 'true') {
      rows = rows.filter((t) => t.hot === true)
    } else if (appliedFilters.hot === 'false') {
      rows = rows.filter((t) => t.hot === false || t.hot == null)
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
      rows: paginatedRows as TourResponse[],
      errorMessage: query.error ? `Failed to load tours: ${query.error.message}` : null,
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