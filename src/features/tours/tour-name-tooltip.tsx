import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import type { HotelResponse, GuideResponse } from '#/lib/travel/schemas'

interface Props {
  name: string
  hotelIds: number[]
  guideIds: number[]
  hotelsMap: Map<number, HotelResponse>
  guidesMap: Map<number, GuideResponse>
}

export function TourNameTooltip({ name, hotelIds, guideIds, hotelsMap, guidesMap }: Props) {
  const hotels = hotelIds.map((id) => hotelsMap.get(id)).filter(Boolean) as HotelResponse[]
  const guides = guideIds.map((id) => guidesMap.get(id)).filter(Boolean) as GuideResponse[]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted underline-offset-2">
          {name}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs space-y-2 p-3">
        <p className="font-semibold text-sm">{name}</p>
        {hotels.length > 0 && (
          <div>
            <p className="text-xs font-medium opacity-70 mb-1">Hotels</p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {hotels.map((hotel) => (
                <li key={hotel.id}>
                  {hotel.name}
                  {hotel.stars ? ` (${hotel.stars} ⭐)` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {guides.length > 0 && (
          <div>
            <p className="text-xs font-medium opacity-70 mb-1">Guides</p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              {guides.map((guide) => (
                <li key={guide.id}>
                  {guide.firstName} {guide.lastName}
                  {guide.experienceYears ? ` (${guide.experienceYears} yrs)` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hotels.length === 0 && guides.length === 0 && (
          <p className="text-xs opacity-70">No hotels or guides assigned</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}