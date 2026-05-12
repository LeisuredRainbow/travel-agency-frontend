import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

interface FilterRenderProps {
  value: string
  onChange: (value: string) => void
}

interface FilterField {
  key: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'date' | 'select' | 'email' | 'phone'
  options?: readonly string[]
  max?: number
  render?: (props: FilterRenderProps) => React.ReactNode
}

interface FilterPanelProps {
  fields: FilterField[]
  onApply: () => void
  onClear: () => void
  onValidationError?: (message: string) => void
}

const ONLY_DIGITS_DOT_MINUS = /[^0-9.\-]/g

function sanitizeNumeric(value: string) {
  let cleaned = value.replace(ONLY_DIGITS_DOT_MINUS, '')
  const minusIndex = cleaned.indexOf('-')
  if (minusIndex > 0) {
    cleaned = cleaned.slice(0, minusIndex) + cleaned.slice(minusIndex + 1)
  }
  const dotIndex = cleaned.indexOf('.')
  if (dotIndex !== -1) {
    const before = cleaned.slice(0, dotIndex)
    const after = cleaned.slice(dotIndex + 1).replace(/\./g, '')
    cleaned = before + '.' + after
  }
  return cleaned
}

function enforceMax(value: string, max?: number) {
  if (max === undefined) return value
  const num = Number(value)
  if (isNaN(num)) return value
  if (num > max) return String(max)
  return value
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/

export function FilterPanel({ fields, onApply, onClear, onValidationError }: FilterPanelProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const hasErrors = Object.keys(errors).length > 0

  const handleApply = () => {
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.render) return
      const val = field.value.trim()
      if (val === '') return

      if (field.type === 'number') {
        const num = Number(val)
        if (isNaN(num) || num <= 0) {
          newErrors[field.key] = 'Must be > 0'
        }
      } else if (field.type === 'email') {
        if (!EMAIL_REGEX.test(val)) {
          newErrors[field.key] = 'Invalid email format (e.g. email@example.com)'
        }
      } else if (field.type === 'phone') {
        if (!PHONE_REGEX.test(val)) {
          newErrors[field.key] = 'Phone must start with "+" and contain 7 to 15 digits'
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      onValidationError?.('Fix errors')
      return
    }

    setErrors({})
    onApply()
  }

  const handleClear = () => {
    setErrors({})
    onClear()
  }

  const validateField = (key: string, value: string, type?: string, max?: number) => {
    const val = value.trim()
    if (val === '') {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      return
    }

    if (type === 'number') {
      const num = Number(val)
      if (isNaN(num) || num <= 0) {
        setErrors((prev) => ({ ...prev, [key]: 'Must be > 0' }))
      } else if (max !== undefined && num > max) {
        setErrors((prev) => ({ ...prev, [key]: `Must be ≤ ${max}` }))
      } else {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    } else if (type === 'email') {
      if (!EMAIL_REGEX.test(val)) {
        setErrors((prev) => ({ ...prev, [key]: 'Invalid email format (e.g. email@example.com)' }))
      } else {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    } else if (type === 'phone') {
      if (!PHONE_REGEX.test(val)) {
        setErrors((prev) => ({ ...prev, [key]: 'Phone must start with "+" and contain 7 to 15 digits' }))
      } else {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    }
  }

  return (
    <div className="space-y-3 p-3 border border-(--line) rounded-lg bg-(--surface)">
      <div className="flex flex-wrap items-end gap-3">
        {fields.map((field) => {
          if (field.render) {
            return (
              <div key={field.key} className="space-y-1 min-w-[180px] flex-1 max-w-[200px]">
                <label className="text-xs font-medium text-(--ink-soft) whitespace-nowrap">
                  {field.label}
                </label>
                {field.render({ value: field.value, onChange: field.onChange })}
              </div>
            )
          }

          const isSelect = field.type === 'select' && field.options
          const isDate = field.type === 'date'

          return (
            <div
              key={field.key}
              className={`space-y-1 min-w-[180px] flex-1 ${isSelect ? 'max-w-[160px]' : ''}`}
            >
              <label className="text-xs font-medium text-(--ink-soft) whitespace-nowrap">
                {field.label}
              </label>
              {isSelect ? (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    {field.options!.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <Input
                    type={isDate ? 'date' : 'text'}
                    inputMode={!isDate && field.type === 'number' ? 'decimal' : undefined}
                    value={field.value}
                    onChange={(e) => {
                      let raw = e.target.value
                      if (!isDate && field.type === 'number') {
                        raw = sanitizeNumeric(raw)
                        raw = enforceMax(raw, field.max)
                      }
                      field.onChange(raw)
                      if (!isDate) validateField(field.key, raw, field.type, field.max)
                    }}
                    placeholder={field.label}
                    className={`h-8 text-sm w-full ${
                      errors[field.key] ? 'border-destructive ring-1 ring-destructive/30' : ''
                    }`}
                  />
                  {errors[field.key] && (
                    <p className="text-xs text-destructive mt-1">{errors[field.key]}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <div className="flex gap-2 items-end pb-0.5">
          <Button size="sm" variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
          <Button size="sm" onClick={handleApply} disabled={hasErrors}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}