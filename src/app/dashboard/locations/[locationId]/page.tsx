'use client';

import { useTranslation } from "@/hooks/use-translation";
import { locations, rooms, beds } from "@/lib/data";
import { notFound } from "next/navigation";
import { LocationMap } from "@/components/locations/location-map";
import { OccupancyOverview } from "@/components/occupancy/occupancy-overview";
import { AvailabilityCalendar } from "@/components/occupancy/availability-calendar";
import { BookingTool } from "@/components/occupancy/booking-tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, BedDouble, CalendarDays, Bot } from "lucide-react";

export default function LocationPage({ params }: { params: { locationId: string } }) {
    const { t } = useTranslation();
    const location = locations.find(l => l.id === params.locationId);

    if (!location) {
        notFound();
    }

    const locationRooms = rooms.filter(r => r.locationId === location.id);
    const roomIds = locationRooms.map(r => r.id);
    const locationBeds = beds.filter(b => roomIds.includes(b.roomId));

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
                        <OccupancyOverview rooms={locationRooms} beds={locationBeds} />
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
