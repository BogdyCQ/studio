"use client";

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Location } from '@/lib/types';
import { MapPin } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useEffect } from 'react';

const sampleLocations: Location[] = [
    {
        id: 'amsterdam',
        name: 'SpaceWise Amsterdam',
        address: 'Dam 1, 1012 JS Amsterdam',
        position: { lat: 52.3731, lng: 4.8926 },
        occupancy: 75,
        imageId: 'amsterdam',
    },
    {
        id: 'rotterdam',
        name: 'SpaceWise Rotterdam',
        address: 'Blaak 1, 3011 GA Rotterdam',
        position: { lat: 51.9225, lng: 4.4840 },
        occupancy: 60,
        imageId: 'rotterdam',
    },
    {
        id: 'utrecht',
        name: 'SpaceWise Utrecht',
        address: 'Domplein 21, 3512 JE Utrecht',
        position: { lat: 52.0907, lng: 5.1214 },
        occupancy: 85,
        imageId: 'utrecht',
    }
];

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
            console.log('No locations found. Seeding database...');
            sampleLocations.forEach(location => {
                const docRef = doc(firestore, 'locations', location.id);
                // Use a non-blocking write to prevent UI freezes.
                // The real-time listener from useCollection will pick up the changes.
                setDocumentNonBlocking(docRef, location);
            });
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
                    {(locations || []).map((location) => (
                        <AdvancedMarker 
                            key={location.id} 
                            position={location.position}
                            onClick={() => router.push(`/dashboard/locations/${location.id}`)}
                        >
                            <MapPin className="h-10 w-10 text-primary drop-shadow-lg cursor-pointer" fill="white" />
                        </AdvancedMarker>
                    ))}
                </Map>
            </APIProvider>
        </div>
    );
}
