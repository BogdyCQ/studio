
"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { addDays, areIntervalsOverlapping, eachDayOfInterval, format, isSameDay, parseISO, startOfDay } from "date-fns";
import type { Bed, Room } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

type AvailabilityCalendarProps = {
  locationId: string;
  beds: Bed[];
  rooms: Room[];
};

type BedStatus = {
    label: 'available' | 'occupied';
    badgeClass: string;
};

const getBedStatusForRange = (bed: Bed, range: DateRange | undefined): BedStatus => {
    if (!range?.from || !range?.to) {
        return { label: 'occupied', badgeClass: 'border-transparent bg-muted text-muted-foreground' };
    }

    const selectionInterval = { start: startOfDay(range.from), end: startOfDay(range.to) };
    
    const isOccupied = bed.reservations?.some(res => 
        areIntervalsOverlapping(selectionInterval, { start: parseISO(res.startDate), end: parseISO(res.endDate) })
    );

    if (isOccupied) {
        return { label: 'occupied', badgeClass: 'border-transparent bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:text-red-300' };
    }

    return { label: 'available', badgeClass: 'border-transparent bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:text-green-300' };
};


export function AvailabilityCalendar({ locationId, beds, rooms }: AvailabilityCalendarProps) {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const today = startOfDay(new Date());
  const defaultSelected: DateRange = {
    from: today,
    to: addDays(today, 4),
  };
  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  
  const [bookingConfirmation, setBookingConfirmation] = useState<{ bed: Bed | null, clientName: string }>({ bed: null, clientName: '' });

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
          dailyCounts[dayKey].occupied += 1;
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

  const handleConfirmBooking = () => {
    const { bed, clientName } = bookingConfirmation;
    if (!bed || !range?.from || !range.to || !clientName) return;

    const newReservation = {
      id: uuidv4(),
      clientName,
      startDate: format(range.from, 'yyyy-MM-dd'),
      endDate: format(range.to, 'yyyy-MM-dd'),
    };

    const bedRef = doc(firestore, `locations/${locationId}/rooms/${bed.roomId}/beds`, bed.id);

    updateDocumentNonBlocking(bedRef, {
      reservations: arrayUnion(newReservation)
    });
    
    toast({
      title: "Reservation Confirmed!",
      description: `Bed ${bed.bedNumber} in ${bed.roomName} has been reserved for ${clientName}.`,
    });

    setBookingConfirmation({ bed: null, clientName: '' });
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <div>
        <Calendar
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={setRange}
          className="rounded-md border p-0"
          disabled={{ before: today }}
          modifiers={{ ...occupancyByDay }}
          modifiersClassNames={{
            low: "bg-green-500/20",
            medium: "bg-yellow-500/20",
            high: "bg-orange-500/20",
            full: "bg-red-500/30 text-destructive-foreground/80",
          }}
        />
      </div>
      
      {range?.from && (
        <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {t('bedStatusFor')}{' '}
              <span className="font-semibold text-primary">
                {format(range.from, "LLL d")}
                {range.to ? ` - ${format(range.to, "LLL d")}` : ''}
              </span>
            </h4>
            <ScrollArea className="h-[350px] rounded-md border p-2">
                <div className="space-y-1">
                    {bedStatuses.map(bed => (
                        <div key={bed.id} className="flex items-center justify-between text-sm p-1 rounded-md hover:bg-muted/50">
                            <div className="flex flex-col truncate">
                                <span className="font-medium">{bed.roomName}</span>
                                <span className="text-muted-foreground text-xs">{bed.bedNumber}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn('capitalize flex-shrink-0 w-20 justify-center', bed.status.badgeClass)}>
                                    {t(bed.status.label)}
                                </Badge>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setBookingConfirmation({ bed, clientName: '' })}
                                    disabled={bed.status.label !== 'available' || !range.to}
                                    className="h-7 text-xs"
                                >
                                    {t('reserve')}
                                </Button>
                            </div>
                        </div>
                    ))}
                    {bedStatuses.length === 0 && <p className="text-muted-foreground text-sm p-4 text-center">{t('noBedsInLocation')}</p>}
                </div>
            </ScrollArea>
        </div>
      )}

      <AlertDialog open={!!bookingConfirmation.bed} onOpenChange={(isOpen) => !isOpen && setBookingConfirmation({bed: null, clientName: ''})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reserve bed <span className="font-semibold">{bookingConfirmation.bed?.bedNumber}</span> in room <span className="font-semibold">{bookingConfirmation.bed?.roomName}</span> from <span className="font-semibold">{range?.from ? format(range.from, "PPP") : ''}</span> to <span className="font-semibold">{range?.to ? format(range.to, "PPP") : ''}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientName" className="text-right">
                  Client Name
                </Label>
                <Input
                  id="clientName"
                  value={bookingConfirmation.clientName}
                  onChange={(e) => setBookingConfirmation(prev => ({...prev, clientName: e.target.value}))}
                  className="col-span-3"
                  placeholder="Enter client's name"
                />
              </div>
            </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking} disabled={!bookingConfirmation.clientName}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
