
'use client';

import { useMemo } from 'react';
import { useTranslation } from "@/hooks/use-translation";
import { notFound } from "next/navigation";
import { AvailabilityCalendar } from "@/components/occupancy/availability-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { LocationMap } from "@/components/locations/location-map";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from '@/components/providers/data-provider';

export default function LocationPage({ params }: { params: { locationId: string } }) {
    const { locationId } = params;
    const { t } = useTranslation();
    const { locations, rooms, beds, isLoading } = useData();

    const location = useMemo(() => {
        if (!locations) return null;
        return locations.find(l => l.id === locationId) || null;
    }, [locations, locationId]);

    const roomsForLocation = useMemo(() => {
        if (!rooms || !location) return [];
        return rooms.filter(r => r.locationId === location.id);
    }, [rooms, location]);

    const bedsForLocation = useMemo(() => {
        if (!beds || !location) return [];
        return beds.filter(b => b.locationId === location.id);
    }, [beds, location]);
    
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-8 grid-cols-1">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Card className="h-96">
                        <Skeleton className="h-full w-full" />
                    </Card>
                    <div className="mt-8">
                         <Card>
                            <CardHeader>
                                <CardTitle><Skeleton className="h-8 w-1/4" /></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-64 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!location) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-8 grid-cols-1">
                <div className="space-y-4">
                    <h1 className="text-3xl font-headline flex items-center gap-2">
                        {location.name}
                    </h1>
                    <p className="text-muted-foreground">{location.address}</p>
                    {location.description && <p className="text-foreground max-w-prose">{location.description}</p>}
                </div>
                <Card className="h-96">
                    <LocationMap location={location} />
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                    <CalendarDays /> {t('availabilityAndBooking')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AvailabilityCalendar locationId={location.id} beds={bedsForLocation} rooms={roomsForLocation} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

