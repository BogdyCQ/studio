
'use client';

import { useTranslation } from "@/hooks/use-translation";
import { notFound } from "next/navigation";
import { OccupancyOverview } from "@/components/occupancy/occupancy-overview";
import { AvailabilityCalendar } from "@/components/occupancy/availability-calendar";
import { BookingTool } from "@/components/occupancy/booking-tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, CalendarDays, Bot } from "lucide-react";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import type { Location, Room, Bed } from "@/lib/types";
import { LocationMap } from "@/components/locations/location-map";
import { Skeleton } from "@/components/ui/skeleton";

export default function LocationPage({ params }: { params: { locationId: string } }) {
    const { locationId } = params;
    const { t } = useTranslation();
    const firestore = useFirestore();

    const locationRef = useMemoFirebase(() => doc(firestore, 'locations', locationId), [firestore, locationId]);
    const { data: location, loading: locationLoading } = useDoc<Location>(locationRef);

    const roomsQuery = useMemoFirebase(() => query(collection(firestore, `locations/${locationId}/rooms`)), [firestore, locationId]);
    const { data: rooms, loading: roomsLoading } = useCollection<Room>(roomsQuery);

    const bedsQuery = useMemoFirebase(() => query(collection(firestore, 'beds'), where('locationId', '==', locationId)), [firestore, locationId]);
    const { data: beds, loading: bedsLoading } = useCollection<Bed>(bedsQuery);

    const isLoading = locationLoading || roomsLoading || bedsLoading;

    if (isLoading) {
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
