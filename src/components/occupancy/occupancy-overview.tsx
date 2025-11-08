
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
      'border-transparent bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:text-green-300',
  },
  occupied: {
    label: 'occupied',
    dotClass: 'bg-red-500',
    badgeClass:
      'border-transparent bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:text-red-300',
  },
  reserved: {
    label: 'reserved',
    dotClass: 'bg-yellow-400',
    badgeClass:
      'border-transparent bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30 dark:text-yellow-300',
  },
};

export function OccupancyOverview({ rooms, beds }: OccupancyOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <div key={room.id}>
            <div className='mb-3'>
              <h4 className="font-headline text-lg flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-muted-foreground" />
                {room.name}
              </h4>
              {room.description && <p className="text-sm text-muted-foreground mt-1 ml-7">{room.description}</p>}
            </div>
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
                      className="p-3 rounded-lg border bg-card shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium flex items-center gap-2 text-sm">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                            {bed.bedNumber}
                          </p>
                          <div
                            className={cn('h-2.5 w-2.5 rounded-full', config.dotClass)}
                          ></div>
                        </div>
                        {bed.description && <p className="text-xs text-muted-foreground mb-2">{bed.description}</p>}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('capitalize w-full justify-center', config.badgeClass)}
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
