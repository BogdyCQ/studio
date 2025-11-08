"use client";

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Location } from '@/lib/types';
import { MapPin } from 'lucide-react';

export function LocationMap({ location }: { location: Location }) {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Google Maps API Key is missing.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-lg overflow-hidden">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={{ lat: 52.1326, lng: 5.2913 }} // Center of Netherlands
                    defaultZoom={7}
                    center={location.position}
                    zoom={14}
                    mapId="spacewise-map"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    className="h-full w-full"
                >
                    <AdvancedMarker position={location.position}>
                        <MapPin className="h-10 w-10 text-primary drop-shadow-lg" fill="white" />
                    </AdvancedMarker>
                </Map>
            </APIProvider>
        </div>
    );
}
