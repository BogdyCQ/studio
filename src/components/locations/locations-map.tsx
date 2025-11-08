
"use client";

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Location } from '@/lib/types';
import { MapPin } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useEffect } from 'react';
import { seedDatabase } from '@/lib/seed';


export function LocationsMap() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const firestore = useFirestore();
    const router = useRouter();
    const { t } = useTranslation();

    const locationsQuery = useMemoFirebase(() => query(collection(firestore, 'locations')), [firestore]);
    const { data: locations, loading } = useCollection<Location>(locationsQuery);

    useEffect(() => {
        // When loading is finished and there are no locations, seed the database.
        if (!loading && locations && locations.length === 0) {
            console.log('No locations found. Seeding database with new data...');
            seedDatabase(firestore);
        }
    }, [locations, loading, firestore]);

    if (!apiKey) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Google Maps API Key is missing.</p>
            </div>
        );
    }
    
    // Show skeleton while initial loading is happening.
    // If locations exist, we can render the map immediately, it will populate as data streams in.
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
                    {(locations || []).map((location) => {
                        return (
                            <AdvancedMarker 
                                key={location.id} 
                                position={location.position}
                                onClick={() => router.push(`/dashboard/locations/${location.id}`)}
                            >
                                <div className="flex flex-col items-center cursor-pointer group">
                                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full border-2 border-primary-foreground shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                        <span className="text-primary-foreground font-bold text-base">
                                            {location.occupancy}%
                                        </span>
                                    </div>
                                    <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-primary transform group-hover:scale-110 transition-transform duration-200"></div>
                                </div>
                            </AdvancedMarker>
                        )
                    })}
                </Map>
            </APIProvider>
        </div>
    );
}



