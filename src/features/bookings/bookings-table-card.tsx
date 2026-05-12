import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#/components/data/data-table'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import type { BookingResponse } from '#/lib/travel/schemas'

interface Props {
  columns: ColumnDef<BookingResponse>[]
  data: BookingResponse[]
  errorMessage: string | null
  headerAction?: React.ReactNode
  page: number
  totalPages: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function BookingsTableCard({
  columns, data, errorMessage, headerAction,
  page, totalPages, canPrev, canNext, onPrev, onNext,
}: Props) {
  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {headerAction && (
          <div className="flex items-center gap-2 w-full">
            {headerAction}
          </div>
        )}
        {errorMessage ? (
          <p className="text-destructive">{errorMessage}</p>
        ) : (
          <>
            <DataTable columns={columns} data={data} />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                {totalPages > 0
                ? `Page ${page + 1} of ${totalPages}`
                : 'Page 0 of 0'}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onPrev} disabled={!canPrev}>
                  Previous
                </Button>
                <Button variant="outline" onClick={onNext} disabled={!canNext}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}