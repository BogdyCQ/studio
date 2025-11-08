"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, ChevronRight } from 'lucide-react';
import type { Location } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

export function LocationList() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const locationsQuery = useMemoFirebase(() => query(collection(firestore, 'locations')), [firestore]);
  const { data: locations, loading } = useCollection<Location>(locationsQuery);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-headline mb-6"><Skeleton className="h-8 w-48" /></h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4 w-full">
                <Skeleton className="w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-md" />
                <div className="flex-1 text-left">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="w-1/4 px-4 hidden sm:block">
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
        <h1 className="text-3xl font-headline mb-6">{t('allLocations')}</h1>
        <div className="w-full space-y-4">
        {(locations || []).map((location) => {
            const placeholder = PlaceHolderImages.find(p => p.id === location.imageId);
            const occupancy = Math.floor(Math.random() * 101);
            return (
            <Link key={location.id} href={`/dashboard/locations/${location.id}`} className="block">
                <Card className="overflow-hidden transition-shadow hover:shadow-lg p-4 hover:bg-accent/50">
                    <div className="flex items-center gap-4 w-full">
                        {placeholder && (
                            <div className="w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0">
                                <Image
                                    src={placeholder.imageUrl}
                                    alt={placeholder.description}
                                    data-ai-hint={placeholder.imageHint}
                                    width={128}
                                    height={80}
                                    className="rounded-md object-cover w-full h-full"
                                />
                            </div>
                        )}
                        <div className="flex-1 text-left">
                            <h3 className="font-headline text-lg">{location.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {location.address}
                            </p>
                        </div>
                        <div className="w-1/4 px-4 hidden sm:block">
                            <div className="flex items-center gap-2">
                                <Progress value={occupancy} className="h-2" />
                                <span className="text-sm font-medium">{occupancy}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-right">{t('occupancyRate')}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Card>
            </Link>
            );
        })}
        </div>
    </div>
  );
}
