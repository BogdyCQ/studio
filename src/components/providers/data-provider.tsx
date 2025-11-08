'use client';

import React, { createContext, useContext, useMemo, ReactNode, useEffect, useRef } from 'react';
import { collection, collectionGroup, query, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Location, Room, Bed } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface DataContextType {
  locations: Location[] | null;
  rooms: Room[] | null;
  beds: Bed[] | null;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();

  const locationsQuery = useMemo(() => query(collection(firestore, 'locations')), [firestore]);
  const { data: locations, loading: locationsLoading } = useCollection<Location>(locationsQuery);

  const roomsQuery = useMemo(() => query(collectionGroup(firestore, 'rooms')), [firestore]);
  const { data: rooms, loading: roomsLoading } = useCollection<Room>(roomsQuery);

  const bedsQuery = useMemo(() => query(collectionGroup(firestore, 'beds')), [firestore]);
  const { data: beds, loading: bedsLoading } = useCollection<Bed>(bedsQuery);

  const isLoading = locationsLoading || roomsLoading || bedsLoading;

  const value = useMemo(() => ({
    locations,
    rooms,
    beds,
    isLoading
  }), [locations, rooms, beds, isLoading]);

  if (isLoading && !locations && !rooms && !beds) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="p-8 space-y-4">
                <h2 className="text-xl font-semibold text-center">Loading SpaceWise Data...</h2>
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-32" />
                    <Skeleton className="h-24 w-32" />
                    <Skeleton className="h-24 w-32" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
