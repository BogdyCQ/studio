"use client";

import Image from 'next/image';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight } from 'lucide-react';
import type { Location } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type LocationListProps = {
  locations: Location[];
};

export function LocationList({ locations }: LocationListProps) {
  const { t } = useTranslation();

  return (
    <div>
        <h1 className="text-3xl font-headline mb-6">{t('allLocations')}</h1>
        <Accordion type="single" collapsible className="w-full space-y-4">
        {locations.map((location, index) => {
            const placeholder = PlaceHolderImages.find(p => p.id === location.imageId);
            return (
            <AccordionItem value={`item-${index}`} key={location.id} className="border-none">
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <AccordionTrigger className="p-4 hover:no-underline data-[state=open]:bg-accent/50 group">
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
                            <Progress value={location.occupancy} className="h-2" />
                            <span className="text-sm font-medium">{location.occupancy}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{t('occupancyRate')}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-accent/20">
                    <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">Detailed view of rooms, beds and availability.</p>
                    <Button asChild>
                        <Link href={`/dashboard/locations/${location.id}`}>
                        {t('locationDetails')} <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    </div>
                </AccordionContent>
                </Card>
            </AccordionItem>
            );
        })}
        </Accordion>
    </div>
  );
}
