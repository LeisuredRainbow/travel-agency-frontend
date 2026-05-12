interface StarFilterProps {
  value: string
  onChange: (value: string) => void
}

export function StarFilter({ value, onChange }: StarFilterProps) {
  const current = value ? Number(value) : 0

  const handleStarClick = (star: number) => {
    if (current === star) {
      onChange('')
    } else {
      onChange(String(star))
    }
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          className="text-xl transition-transform hover:scale-110 focus:outline-none"
        >
          {star <= current ? '⭐' : '☆'}
        </button>
      ))}
      {current > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="ml-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Any
        </button>
      )}
    </div>
  )
}