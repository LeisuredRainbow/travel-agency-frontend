import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#/components/data/data-table'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import type { TourResponse } from '#/lib/travel/schemas'

interface Props {
  columns: ColumnDef<TourResponse>[]
  data: TourResponse[]
  errorMessage: string | null
  headerAction?: React.ReactNode
}

export function ToursTableCard({ columns, data, errorMessage, headerAction }: Props) {
  return (
    <Card>
      {headerAction ? (
        <CardHeader className="flex-row items-center justify-end">
          {headerAction}
        </CardHeader>
      ) : null}
      <CardContent>
        {errorMessage ? (
          <p className="text-destructive">{errorMessage}</p>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </CardContent>
    </Card>
  )
}