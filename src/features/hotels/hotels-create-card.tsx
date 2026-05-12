import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import type { HotelRequest } from '#/lib/travel/schemas'

interface Props {
  value: HotelRequest
  onChange: React.Dispatch<React.SetStateAction<HotelRequest>>
  onApply: () => void
  isPending: boolean
  editingId: number | null
  onCancelEdit: () => void
}

interface FieldErrors {
  name?: string
  stars?: string
}

const inputBaseClasses =
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'

function StarSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (stars: number) => void
}) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl focus:outline-none transition-transform hover:scale-110"
        >
          {star <= value ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export function HotelsCreateCard({ value, onChange, onApply, isPending, editingId, onCancelEdit }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({})

  const validate = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!value.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!value.stars || value.stars < 1 || value.stars > 5) {
      newErrors.stars = 'Stars must be between 1 and 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onApply()
    }
  }

  const clearError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? 'Edit Hotel' : 'Create Hotel'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              type="text"
              value={value.name}
              onChange={(e) => {
                onChange({ ...value, name: e.target.value })
                clearError('name')
              }}
              className={`${inputBaseClasses} ${errors.name ? 'border-destructive ring-destructive/20' : ''}`}
              autoComplete="off"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <input
              id="address"
              type="text"
              value={value.address ?? ''}
              onChange={(e) => onChange({ ...value, address: e.target.value })}
              className={inputBaseClasses}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>Stars</Label>
            <StarSelector
              value={value.stars ?? 0}
              onChange={(stars) => {
                onChange({ ...value, stars })
                clearError('stars')
              }}
            />
            {errors.stars && <p className="text-xs text-destructive">{errors.stars}</p>}
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}