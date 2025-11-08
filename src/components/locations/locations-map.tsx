
"use client";

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Location, Bed, Room } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useMemo } from 'react';


export function LocationsMap() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const firestore = useFirestore();
    const router = useRouter();
    const { t } = useTranslation();

    const locationsQuery = useMemoFirebase(() => query(collection(firestore, 'locations')), [firestore]);
    const { data: locations, loading: locationsLoading } = useCollection<Location>(locationsQuery);

    const roomsQuery = useMemoFirebase(() => query(collectionGroup(firestore, 'rooms')), [firestore]);
    const { data: rooms, loading: roomsLoading } = useCollection<Room>(roomsQuery);

    const bedsQuery = useMemoFirebase(() => query(collectionGroup(firestore, 'beds')), [firestore]);
    const { data: beds, loading: bedsLoading } = useCollection<Bed>(bedsQuery);

    const locationsWithOccupancy = useMemo(() => {
        if (!locations || !beds || !rooms) return [];
        
        return locations.map(location => {
          const roomsInLocation = rooms.filter(room => room.locationId === location.id);
          const roomIdsInLocation = roomsInLocation.map(room => room.id);
          const bedsForLocation = beds.filter(bed => roomIdsInLocation.includes(bed.roomId));

          const occupiedBeds = bedsForLocation.filter(bed => bed.status === 'occupied').length;
          const totalBeds = bedsForLocation.length;
          const occupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
          return { ...location, occupancy };
        });
    }, [locations, rooms, beds]);

    const loading = locationsLoading || bedsLoading || roomsLoading;


    if (!apiKey) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Google Maps API Key is missing.</p>
            </div>
        );
    }
    
    // Show skeleton while initial loading is happening.
    if (loading && (!locations || locations.length === 0)) {
        return (
            <div className="h-full w-full">
                <Skeleton className="h-full w-full" />
            </div>
        )
    }

    return (
        <div className="h-full w-full rounded-lg overflow-hidden">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={{ lat: 52.1326, lng: 5.2913 }} // Center of Netherlands
                    defaultZoom={8}
                    mapId="spacewise-map-overview"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    className="h-full w-full"
                >
                    {(locationsWithOccupancy).map((location) => {
                        return (
                            <AdvancedMarker 
                                key={location.id} 
                                position={location.position}
                                onClick={() => router.push(`/dashboard/locations/${location.id}`)}
                            >
                               <div className="relative cursor-pointer">
                                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                                        {location.occupancy}%
                                    </div>
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[12px] border-t-primary"></div>
                                </div>
                            </AdvancedMarker>
                        )
                    })}
                </Map>
            </APIProvider>
        </div>
    );
}
