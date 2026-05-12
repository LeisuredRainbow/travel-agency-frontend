import { cn } from '#/lib/utils'

interface PageHeaderSectionProps {
  readonly title: string
  readonly description?: string
  readonly className?: string
  readonly titleClassName?: string
  readonly descriptionClassName?: string
  readonly kicker?: string
}

export function PageHeaderSection(props: Readonly<PageHeaderSectionProps>) {
  const {
    kicker,
    title,
    description,
    className,
    titleClassName,
    descriptionClassName,
  } = props

  return (
    <header className={cn('space-y-2', className)}>
      {kicker ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-(--kicker)">
          {kicker}
        </p>
      ) : null}
      <h1
        className={cn(
          'display-title text-4xl font-bold text-(--ink)',
          titleClassName,
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            'text-sm text-muted-foreground',
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}