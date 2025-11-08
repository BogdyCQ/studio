'use client';

import { useTranslation } from "@/hooks/use-translation";
import { notFound } from "next/navigation";
import { LocationMap } from "@/components/locations/location-map";
import { OccupancyOverview } from "@/components/occupancy/occupancy-overview";
import { AvailabilityCalendar } from "@/components/occupancy/availability-calendar";
import { BookingTool } from "@/components/occupancy/booking-tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, BedDouble, CalendarDays, Bot } from "lucide-react";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import type { Location, Room, Bed } from "@/lib/types";

export default function LocationPage({ params }: { params: { locationId: string } }) {
    const { t } = useTranslation();
    const firestore = useFirestore();

    const locationRef = useMemoFirebase(() => doc(firestore, 'locations', params.locationId), [firestore, params.locationId]);
    const { data: location, loading: locationLoading } = useDoc<Location>(locationRef);

    const roomsQuery = useMemoFirebase(() => query(collection(firestore, `locations/${params.locationId}/rooms`)), [firestore, params.locationId]);
    const { data: rooms, loading: roomsLoading } = useCollection<Room>(roomsQuery);

    const bedsQuery = useMemoFirebase(() => {
        if (!rooms || rooms.length === 0) return null;
        const roomIds = rooms.map(r => r.id);
        // Firestore 'in' queries are limited to 10 elements. If you have more rooms, you'll need to fetch beds differently.
        // For this app, we assume there won't be more than 10 rooms per location.
        return query(collection(firestore, `locations/${params.locationId}/beds`), where('roomId', 'in', roomIds));
    }, [firestore, params.locationId, rooms]);
    const { data: beds, loading: bedsLoading } = useCollection<Bed>(bedsQuery);

    if (locationLoading || roomsLoading || bedsLoading) {
        return <div>Loading...</div>; // TODO: Add skeleton loader
    }

    if (!location) {
        notFound();
    }

    return (
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                            <Map /> {location.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] -m-2">
                        <LocationMap location={location} />
                    </CardContent>
                </Card>
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
    );
}
