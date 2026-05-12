import { useState, useRef } from 'react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { Checkbox } from '#/components/ui/checkbox'
import type { TourRequest, HotelResponse, GuideResponse } from '#/lib/travel/schemas'

interface Props {
  value: TourRequest
  onChange: React.Dispatch<React.SetStateAction<TourRequest>>
  onApply: () => void
  isPending: boolean
  editingId: number | null
  onCancelEdit: () => void
  hotels: HotelResponse[]
  guides: GuideResponse[]
  hotelsLoading: boolean
  guidesLoading: boolean
}

interface FieldErrors {
  name?: string
  country?: string
  price?: string
  durationDays?: string
}

const inputBaseClasses =
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'

export function ToursCreateCard({
  value, onChange, onApply, isPending, editingId, onCancelEdit,
  hotels, guides, hotelsLoading, guidesLoading,
}: Props) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const nameRef = useRef<HTMLInputElement>(null)
  const countryRef = useRef<HTMLInputElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)
  const durationRef = useRef<HTMLInputElement>(null)

  const validate = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!value.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!value.country.trim()) {
      newErrors.country = 'Country is required'
    }
    if (!value.price || value.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (!value.durationDays || value.durationDays <= 0) {
      newErrors.durationDays = 'Must be at least 1 day'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const refMap: Record<string, React.RefObject<HTMLInputElement | null>> = {
        name: nameRef,
        country: countryRef,
        price: priceRef,
        durationDays: durationRef,
      }
      const firstField = Object.keys(newErrors)[0]
      const targetRef = refMap[firstField]

      setTimeout(() => {
        if (targetRef?.current) {
          targetRef.current.scrollIntoView({ block: 'center' })
          targetRef.current.focus()
        }
      }, 150)

      return false
    }

    return true
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
        <CardTitle>{editingId ? 'Edit Tour' : 'Create Tour'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2 max-h-96 overflow-y-auto pr-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <input
              id="name"
              ref={nameRef}
              type="text"
              value={value.name}
              onChange={(e) => {
                onChange({ ...value, name: e.target.value })
                clearError('name')
              }}
              className={`${inputBaseClasses} ${errors.name ? 'border-destructive ring-destructive/20' : ''}`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <input
              id="country"
              ref={countryRef}
              type="text"
              value={value.country}
              onChange={(e) => {
                onChange({ ...value, country: e.target.value })
                clearError('country')
              }}
              className={`${inputBaseClasses} ${errors.country ? 'border-destructive ring-destructive/20' : ''}`}
            />
            {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <input
              id="price"
              ref={priceRef}
              type="number"
              value={value.price}
              onChange={(e) => {
                onChange({ ...value, price: +e.target.value })
                clearError('price')
              }}
              className={`${inputBaseClasses} no-spinner ${errors.price ? 'border-destructive ring-destructive/20' : ''}`}
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <input
              id="duration"
              ref={durationRef}
              type="number"
              value={value.durationDays ?? ''}
              onChange={(e) => {
                onChange({ ...value, durationDays: +e.target.value || 0 })
                clearError('durationDays')
              }}
              className={`${inputBaseClasses} no-spinner ${errors.durationDays ? 'border-destructive ring-destructive/20' : ''}`}
            />
            {errors.durationDays && <p className="text-xs text-destructive">{errors.durationDays}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <input
              id="description"
              type="text"
              value={value.description ?? ''}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              className={inputBaseClasses}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Hotels</Label>
            <div className="border border-(--line) rounded-md p-2 max-h-32 overflow-y-auto">
              {hotelsLoading ? (
                <p className="text-sm text-muted-foreground">Loading hotels...</p>
              ) : (
                hotels.map((hotel) => (
                  <label key={hotel.id} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={value.hotelIds?.includes(hotel.id) ?? false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        const current = value.hotelIds ?? []
                        onChange({
                          ...value,
                          hotelIds: checked ? [...current, hotel.id] : current.filter((id) => id !== hotel.id),
                        })
                      }}
                    />
                    {hotel.name} ({hotel.stars} ⭐)
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Guides</Label>
            <div className="border border-(--line) rounded-md p-2 max-h-32 overflow-y-auto">
              {guidesLoading ? (
                <p className="text-sm text-muted-foreground">Loading guides...</p>
              ) : (
                guides.map((guide) => (
                  <label key={guide.id} className="flex items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={value.guideIds?.includes(guide.id) ?? false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        const current = value.guideIds ?? []
                        onChange({
                          ...value,
                          guideIds: checked ? [...current, guide.id] : current.filter((id) => id !== guide.id),
                        })
                      }}
                    />
                    {guide.firstName} {guide.lastName} ({guide.experienceYears} yrs)
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-md border border-(--line) bg-(--surface) p-2">
            <Checkbox
              id="hot"
              checked={value.hot ?? false}
              onCheckedChange={(checked) => onChange({ ...value, hot: Boolean(checked) })}
            />
            <Label htmlFor="hot">Hot offer</Label>
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