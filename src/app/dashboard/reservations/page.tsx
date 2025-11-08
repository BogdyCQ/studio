'use client';

import { useMemo } from 'react';
import { useData } from '@/components/providers/data-provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import type { Reservation, Location, Room, Bed } from '@/lib/types';
import { format, parseISO } from 'date-fns';

type EnrichedReservation = Reservation & {
  locationName: string;
  roomName: string;
  bedNumber: string;
};

export default function ReservationsPage() {
  const { t } = useTranslation();
  const { locations, rooms, beds, isLoading } = useData();

  const enrichedReservations = useMemo((): EnrichedReservation[] => {
    if (!beds || !rooms || !locations) {
      return [];
    }

    const roomsMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
    const locationsMap = new Map<string, Location>(locations.map(l => [l.id, l]));

    const allReservations = beds.flatMap(bed => {
      const room = roomsMap.get(bed.roomId);
      const location = room ? locationsMap.get(room.locationId) : undefined;

      return (bed.reservations || []).map(reservation => ({
        ...reservation,
        bedNumber: bed.bedNumber,
        roomName: room?.name || 'N/A',
        locationName: location?.name || 'N/A',
      }));
    });

    // Sort by most recent start date
    allReservations.sort((a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());

    return allReservations;
  }, [beds, rooms, locations]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-headline mb-6"><Skeleton className="h-8 w-64" /></h1>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-headline mb-6">{t('reservationsHistory')}</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('clientName')}</TableHead>
              <TableHead>{t('location')}</TableHead>
              <TableHead>{t('room')}</TableHead>
              <TableHead>{t('bed')}</TableHead>
              <TableHead>{t('startDate')}</TableHead>
              <TableHead>{t('endDate')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrichedReservations.length > 0 ? (
              enrichedReservations.map(res => (
                <TableRow key={res.id}>
                  <TableCell className="font-medium">{res.clientName}</TableCell>
                  <TableCell>{res.locationName}</TableCell>
                  <TableCell>{res.roomName}</TableCell>
                  <TableCell>{res.bedNumber}</TableCell>
                  <TableCell>{format(parseISO(res.startDate), 'PPP')}</TableCell>
                  <TableCell>{format(parseISO(res.endDate), 'PPP')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">{t('noReservationsFound')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
