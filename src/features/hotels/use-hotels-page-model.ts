import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchHotels, createHotel, updateHotel, deleteHotel } from '#/lib/travel/functions/hotels.functions'
import type { HotelRequest, HotelResponse } from '#/lib/travel/schemas'
import { queryKeys } from '#/lib/travel/query-keys'

interface Notifications {
  onSuccess?: (msg: string) => void
  onError?: (msg: string) => void
}

interface HotelFilters {
  name: string
  address: string
  minStars: string
  maxStars: string
}

const initialFilters: HotelFilters = {
  name: '',
  address: '',
  minStars: '',
  maxStars: '',
}

export function useHotelsPageModel(notifications?: Notifications) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<HotelRequest>({
    name: '',
    address: '',
    stars: 0,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filters, setFilters] = useState<HotelFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<HotelFilters>(initialFilters)
  const [page, setPage] = useState(0)
  const pageSize = 5

  const query = useQuery({
    queryKey: queryKeys.hotels,
    queryFn: fetchHotels,
  })

  const createMutation = useMutation({
    mutationFn: createHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels })
      notifications?.onSuccess?.('Hotel created')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to create hotel')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HotelRequest> }) =>
      updateHotel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels })
      notifications?.onSuccess?.('Hotel updated')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to update hotel')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hotels })
      notifications?.onSuccess?.('Hotel deleted')
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to delete hotel')
    },
  })

  const handleSave = () => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (hotel: HotelRequest & { id: number }) => {
    setEditingId(hotel.id)
    setForm({ name: hotel.name, address: hotel.address ?? '', stars: hotel.stars ?? 0 })
  }

  const cancelEdit = () => resetForm()
  const resetForm = () => {
    setEditingId(null)
    setForm({ name: '', address: '', stars: 0 })
  }

  const updateFilter = (key: keyof HotelFilters, value: string) => {
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
      rows = rows.filter((h) => h.name.toLowerCase().includes(appliedFilters.name.toLowerCase()))
    }
    if (appliedFilters.address) {
      rows = rows.filter((h) => h.address?.toLowerCase().includes(appliedFilters.address.toLowerCase()))
    }
    const min = parseInt(appliedFilters.minStars)
    if (!isNaN(min)) {
      rows = rows.filter((h) => (h.stars ?? 0) >= min)
    }
    const max = parseInt(appliedFilters.maxStars)
    if (!isNaN(max)) {
      rows = rows.filter((h) => (h.stars ?? 0) <= max)
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
      rows: paginatedRows as HotelResponse[],
      errorMessage: query.error ? `Failed to load hotels: ${query.error.message}` : null,
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