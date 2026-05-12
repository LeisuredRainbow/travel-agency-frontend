import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBookings, createBooking, updateBooking, deleteBooking } from '#/lib/travel/functions/bookings.functions'
import { fetchTours } from '#/lib/travel/functions/tours.functions'
import { fetchClients } from '#/lib/travel/functions/clients.functions'
import { travelRequest } from '#/lib/travel/travel-request'
import type { BookingRequest, TourResponse, ClientResponse } from '#/lib/travel/schemas'
import { queryKeys } from '#/lib/travel/query-keys'

interface Notifications {
  onSuccess?: (msg: string) => void
  onError?: (msg: string) => void
}

interface BookingFilters {
  tourName: string
  clientName: string
  minDate: string
  maxDate: string
  status: string
}

const initialFilters: BookingFilters = {
  tourName: '',
  clientName: '',
  minDate: '',
  maxDate: '',
  status: '',
}

export function useBookingsPageModel(notifications?: Notifications) {
  const queryClient = useQueryClient()
  const [items, setItems] = useState<BookingRequest[]>([
    { clientId: 0, tourId: 0, bookingDate: '', status: 'PENDING' },
  ])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filters, setFilters] = useState<BookingFilters>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<BookingFilters>(initialFilters)
  const [page, setPage] = useState(0)
  const pageSize = 5

  const query = useQuery({
    queryKey: queryKeys.bookings,
    queryFn: fetchBookings,
  })

  const toursQuery = useQuery({
    queryKey: ['tours'],
    queryFn: fetchTours,
  })

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  })

  const toursById = useMemo(() => {
    const map = new Map<number, TourResponse>()
    ;(toursQuery.data ?? []).forEach((t) => map.set(t.id, t))
    return map
  }, [toursQuery.data])

  const clientsById = useMemo(() => {
    const map = new Map<number, ClientResponse>()
    ;(clientsQuery.data ?? []).forEach((c) => map.set(c.id, c))
    return map
  }, [clientsQuery.data])

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      notifications?.onSuccess?.('Booking created')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to create booking')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BookingRequest> }) =>
      updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      notifications?.onSuccess?.('Booking updated')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to update booking')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      notifications?.onSuccess?.('Booking deleted')
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to delete booking')
    },
  })

  const bulkMutation = useMutation({
    mutationFn: (data: BookingRequest[]) =>
      travelRequest({ path: '/api/bookings/bulk', method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      notifications?.onSuccess?.('Bulk bookings created')
      resetForm()
    },
    onError: (error: Error) => {
      notifications?.onError?.(error.message || 'Failed to create bulk bookings')
    },
  })

  const handleSave = () => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: items[0] })
    } else {
      if (items.length === 1) {
        createMutation.mutate(items[0])
      } else {
        bulkMutation.mutate(items)
      }
    }
  }

  const startEdit = (booking: BookingRequest & { id: number }) => {
    setEditingId(booking.id)
    setItems([{
      clientId: booking.clientId,
      tourId: booking.tourId,
      bookingDate: booking.bookingDate,
      status: booking.status,
    }])
  }

  const cancelEdit = () => resetForm()
  const resetForm = () => {
    setEditingId(null)
    setItems([{ clientId: 0, tourId: 0, bookingDate: '', status: 'PENDING' }])
  }

  const addRow = () => {
    if (editingId === null) {
      setItems([...items, { clientId: 0, tourId: 0, bookingDate: '', status: 'PENDING' }])
    }
  }

  const removeRow = (index: number) => {
    if (editingId === null && items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateRow = (index: number, patch: Partial<BookingRequest>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const updateFilter = (key: keyof BookingFilters, value: string) => {
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

    if (appliedFilters.tourName) {
      const val = appliedFilters.tourName.toLowerCase()
      rows = rows.filter((b) => {
        const tour = toursById.get(b.tourId)
        return tour?.name?.toLowerCase().includes(val)
      })
    }
    if (appliedFilters.clientName) {
      const val = appliedFilters.clientName.toLowerCase()
      rows = rows.filter((b) => {
        const client = clientsById.get(b.clientId)
        const fullName = `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.toLowerCase()
        return fullName.includes(val)
      })
    }
    if (appliedFilters.minDate) {
      rows = rows.filter((b) => b.bookingDate >= appliedFilters.minDate)
    }
    if (appliedFilters.maxDate) {
      rows = rows.filter((b) => b.bookingDate <= appliedFilters.maxDate)
    }
    if (appliedFilters.status) {
      const val = appliedFilters.status.toUpperCase()
      rows = rows.filter((b) => b.status === val)
    }

    return rows
  }, [query.data, appliedFilters, toursById, clientsById])

  const totalPages = Math.ceil(filteredRows.length / pageSize)

  const safePage = useMemo(() => {
    if (totalPages === 0) return 0
    return Math.min(page, totalPages - 1)
  }, [page, totalPages])

  const paginatedRows = useMemo(() => {
    const start = safePage * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safePage])

  const pendingBookings = useMemo(() => {
    return (query.data ?? [])
      .filter((b) => b.status === 'PENDING')
      .map((b) => {
        const tour = toursById.get(b.tourId)
        const client = clientsById.get(b.clientId)
        return {
          id: b.id,
          tourName: tour?.name ?? `Tour #${b.tourId}`,
          clientName: client ? `${client.firstName} ${client.lastName}` : `Client #${b.clientId}`,
        }
      })
  }, [query.data, toursById, clientsById])

  return {
    table: {
      rows: paginatedRows,
      errorMessage: query.error ? `Failed to load bookings: ${query.error.message}` : null,
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
      items,
      setItems,
      editingId,
      isPending: editingId !== null ? updateMutation.isPending : items.length === 1 ? createMutation.isPending : bulkMutation.isPending,
      onSave: handleSave,
      startEdit,
      cancelEdit,
      addRow,
      removeRow,
      updateRow,
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
    lookups: {
      tours: toursById,
      clients: clientsById,
      isLoading: toursQuery.isLoading || clientsQuery.isLoading,
    },
    pendingBookings,
  }
}