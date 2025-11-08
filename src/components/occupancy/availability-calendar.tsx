
"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { addDays, areIntervalsOverlapping, eachDayOfInterval, format, isSameDay, parseISO, startOfDay } from "date-fns";
import type { Bed, Room } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

type AvailabilityCalendarProps = {
  beds: Bed[];
  rooms: Room[];
};

const getBedStatusForRange = (bed: Bed, range: DateRange) => {
    if (!range.from || !range.to) return { label: 'available', badgeClass: 'border-transparent bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:text-green-300' };

    const selectionInterval = { start: startOfDay(range.from), end: startOfDay(range.to) };
    
    const isOccupied = bed.reservations?.some(res => 
        areIntervalsOverlapping(selectionInterval, { start: parseISO(res.startDate), end: parseISO(res.endDate) })
    );

    if (isOccupied) {
        return { label: 'occupied', badgeClass: 'border-transparent bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:text-red-300' };
    }

    return { label: 'available', badgeClass: 'border-transparent bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:text-green-300' };
};


export function AvailabilityCalendar({ beds, rooms }: AvailabilityCalendarProps) {
  const { t } = useTranslation();
  const today = startOfDay(new Date());
  const defaultSelected: DateRange = {
    from: today,
    to: addDays(today, 4),
  };
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);

  const occupancyByDay = useMemo(() => {
    const dailyCounts: Record<string, { occupied: number; total: number }> = {};
    
    beds.forEach(bed => {
      bed.reservations?.forEach(res => {
        const start = parseISO(res.startDate);
        const end = parseISO(res.endDate);
        const intervalDays = eachDayOfInterval({ start, end });
        
        intervalDays.forEach(day => {
          const dayKey = format(day, 'yyyy-MM-dd');
          if (!dailyCounts[dayKey]) {
            dailyCounts[dayKey] = { occupied: 0, total: beds.length };
          }
          // Ensure we don't double-count if a bed has multiple reservations on the same day (shouldn't happen with valid data)
          // This simple check is fine for now
          const alreadyCounted = beds.some(b => b.id === bed.id && b.reservations?.some(r => r.id === res.id && isSameDay(day, start)));
          if (alreadyCounted || isSameDay(day, start)) {
             dailyCounts[dayKey].occupied += 1;
          }
        });
      });
    });

    const modifiers: Record<string, Date[]> = {
      low: [],
      medium: [],
      high: [],
      full: [],
    };

    for (const dayKey in dailyCounts) {
      const { occupied, total } = dailyCounts[dayKey];
      const occupancy = total > 0 ? (occupied / total) * 100 : 0;
      const date = parseISO(dayKey);

      if (occupancy >= 100) modifiers.full.push(date);
      else if (occupancy >= 70) modifiers.high.push(date);
      else if (occupancy >= 40) modifiers.medium.push(date);
      else if (occupancy > 0) modifiers.low.push(date);
    }
    
    return modifiers;
  }, [beds]);

  const bedStatuses = useMemo(() => {
    if (!range) return [];
    return beds.map(bed => {
        const room = rooms.find(r => r.id === bed.roomId);
        return {
            ...bed,
            roomName: room ? room.name : 'Unknown Room',
            status: getBedStatusForRange(bed, range)
        }
    }).sort((a,b) => {
        if (a.roomName !== b.roomName) {
            return a.roomName.localeCompare(b.roomName);
        }
        return a.bedNumber.localeCompare(b.bedNumber);
    });
  }, [beds, rooms, range]);

  return (
    <div className="space-y-4">
      <Calendar
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={setRange}
        className="rounded-md border p-0"
        disabled={{ before: today }}
        modifiers={{
          ...occupancyByDay
        }}
        modifiersClassNames={{
          low: "bg-green-500/20",
          medium: "bg-yellow-500/20",
          high: "bg-orange-500/20",
          full: "bg-red-500/30 text-destructive-foreground/80",
        }}
      />
      
      {range?.from && (
        <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {t('bedStatusFor')}{' '}
              <span className="font-semibold text-primary">
                {format(range.from, "LLL d")}
                {range.to ? ` - ${format(range.to, "LLL d")}` : ''}
              </span>
            </h4>
            <ScrollArea className="h-48 rounded-md border p-2">
                <div className="space-y-2">
                    {bedStatuses.map(bed => (
                        <div key={bed.id} className="flex items-center justify-between text-sm">
                            <span className="truncate">
                                <span className="font-medium">{bed.roomName}</span>
                                <span className="text-muted-foreground"> - {bed.bedNumber}</span>
                            </span>
                            <Badge variant="outline" className={cn('capitalize flex-shrink-0', bed.status.badgeClass)}>
                                {t(bed.status.label)}
                            </Badge>
                        </div>
                    ))}
                    {bedStatuses.length === 0 && <p className="text-muted-foreground text-sm p-4 text-center">{t('noBedsInLocation')}</p>}
                </div>
            </ScrollArea>
        </div>
      )}
    </div>
  );
}
