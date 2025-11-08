
'use client';

import { useTranslation } from "@/hooks/use-translation";
import { notFound } from "next/navigation";
import { OccupancyOverview } from "@/components/occupancy/occupancy-overview";
import { AvailabilityCalendar } from "@/components/occupancy/availability-calendar";
import { BookingTool } from "@/components/occupancy/booking-tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, CalendarDays, Bot } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, collectionGroup } from "firebase/firestore";
import type { Location, Room, Bed } from "@/lib/types";
import { LocationMap } from "@/components/locations/location-map";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";


export default function LocationPage({ params }: { params: { locationId: string } }) {
    const { locationId } = params;
    const { t } = useTranslation();
    const firestore = useFirestore();

    // Fetch all locations and find the current one in memory
    const locationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'locations'));
    }, [firestore]);
    
    const { data: locations, loading: locationLoading } = useCollection<Location>(locationsQuery);

    const location = useMemo(() => {
        if (!locations) return null;
        return locations.find(l => l.id === locationId);
    }, [locations, locationId]);

    const roomsQuery = useMemoFirebase(() => {
        if (!firestore || !locationId) return null;
        return query(collection(firestore, `locations/${locationId}/rooms`));
    }, [firestore, locationId]);
    const { data: rooms, loading: roomsLoading } = useCollection<Room>(roomsQuery);

    const bedsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Use collectionGroup to query beds across all subcollections
        return query(collectionGroup(firestore, 'beds'));
    }, [firestore]);
    
    const { data: allBeds, loading: bedsLoading } = useCollection<Bed>(bedsQuery);

    const beds = useMemo(() => {
        if (!allBeds) return [];
        return allBeds.filter(bed => bed.locationId === locationId);
    }, [allBeds, locationId])


    const isLoading = locationLoading || roomsLoading || bedsLoading;
    
    // After loading, if the location is not found in the array, then it's a 404
    if (!isLoading && !location) {
        notFound();
    }

    if (isLoading || !location) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-3 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle><Skeleton className="h-8 w-1/2" /></CardTitle>
                            </CardHeader>
                            <CardContent className="h-96">
                                <Skeleton className="h-full w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle><Skeleton className="h-8 w-1/4" /></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-40 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle><Skeleton className="h-8 w-1/2" /></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-64 w-full" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle><Skeleton className="h-8 w-1/2" /></CardTitle>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                <BedDouble /> {t('roomsAndBeds')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <OccupancyOverview rooms={rooms || []} beds={beds || []} />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                    <CalendarDays /> {t('availability')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AvailabilityCalendar />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                    <Bot /> {t('bookingTool')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BookingTool locationId={location.id} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
