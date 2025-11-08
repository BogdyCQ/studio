'use client';

import type { Bed, Room } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { BedDouble, DoorOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type OccupancyOverviewProps = {
  rooms: Room[];
  beds: Bed[];
};

const statusConfig: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  available: {
    label: 'available',
    dotClass: 'bg-green-500',
    badgeClass:
      'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700',
  },
  occupied: {
    label: 'occupied',
    dotClass: 'bg-red-500',
    badgeClass:
      'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700',
  },
  reserved: {
    label: 'reserved',
    dotClass: 'bg-yellow-400',
    badgeClass:
      'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700',
  },
};

export function OccupancyOverview({ rooms, beds }: OccupancyOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <div key={room.id}>
            <h4 className="font-headline text-lg mb-3 flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-muted-foreground" />
              {room.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {beds
                .filter((bed) => bed.roomId === room.id)
                .map((bed) => {
                  const config =
                    statusConfig[bed.status as keyof typeof statusConfig] ||
                    statusConfig.available;
                  return (
                    <div
                      key={bed.id}
                      className="p-3 rounded-lg border bg-card shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium flex items-center gap-2 text-sm">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          {bed.bedNumber}
                        </p>
                        <div
                          className={cn('h-2.5 w-2.5 rounded-full', config.dotClass)}
                        ></div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('capitalize', config.badgeClass)}
                      >
                        {t(config.label)}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">{t('noRoomsAvailable')}</p>
      )}
    </div>
  );
}
