import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import type { GuideRequest } from '#/lib/travel/schemas'

interface Props {
  value: GuideRequest
  onChange: React.Dispatch<React.SetStateAction<GuideRequest>>
  onApply: () => void
  isPending: boolean
  editingId: number | null
  onCancelEdit: () => void
}

interface FieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  experienceYears?: string
}

const inputBaseClasses =
  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'

export function GuidesCreateCard({ value, onChange, onApply, isPending, editingId, onCancelEdit }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({})

  const validate = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!value.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!value.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!value.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (value.email.length > 320) {
      newErrors.email = 'Email cannot exceed 320 characters'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) {
      newErrors.email = 'Invalid email format (e.g. email@example.com)'
    }
    const phone = (value.phone ?? '').trim()
    if (!phone) {
      newErrors.phone = 'Phone is required'
    } else if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      newErrors.phone = 'Phone must start with "+" and contain 7 to 15 digits'
    }
    if (value.experienceYears != null && value.experienceYears < 0) {
      newErrors.experienceYears = 'Experience cannot be negative'
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
        <CardTitle>{editingId ? 'Edit Guide' : 'Create Guide'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <input
              id="firstName"
              type="text"
              value={value.firstName}
              onChange={(e) => {
                onChange({ ...value, firstName: e.target.value })
                clearError('firstName')
              }}
              className={`${inputBaseClasses} ${errors.firstName ? 'border-destructive ring-destructive/20' : ''}`}
              autoComplete="off"
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <input
              id="lastName"
              type="text"
              value={value.lastName}
              onChange={(e) => {
                onChange({ ...value, lastName: e.target.value })
                clearError('lastName')
              }}
              className={`${inputBaseClasses} ${errors.lastName ? 'border-destructive ring-destructive/20' : ''}`}
              autoComplete="off"
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <input
              id="phone"
              type="text"
              maxLength={15}
              placeholder="+375291234567"
              value={value.phone ?? ''}
              onChange={(e) => {
                onChange({ ...value, phone: e.target.value })
                clearError('phone')
              }}
              className={`${inputBaseClasses} ${errors.phone ? 'border-destructive ring-destructive/20' : ''}`}
              autoComplete="off"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="text"
              maxLength={320}
              placeholder="email@example.com"
              value={value.email}
              onChange={(e) => {
                onChange({ ...value, email: e.target.value })
                clearError('email')
              }}
              className={`${inputBaseClasses} ${errors.email ? 'border-destructive ring-destructive/20' : ''}`}
              autoComplete="off"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceYears">Experience (years)</Label>
            <input
              id="experienceYears"
              type="number"
              value={value.experienceYears ?? ''}
              onChange={(e) => {
                onChange({ ...value, experienceYears: +e.target.value || 0 })
                clearError('experienceYears')
              }}
              className={`${inputBaseClasses} no-spinner ${errors.experienceYears ? 'border-destructive ring-destructive/20' : ''}`}
              autoComplete="off"
            />
            {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears}</p>}
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