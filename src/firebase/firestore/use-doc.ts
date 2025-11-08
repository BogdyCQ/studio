'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  doc,
  getDoc,
  DocumentReference,
  DocumentData,
  FirestoreError,
  Unsubscribe
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useMemoFirebase } from '@/firebase/provider';


// Type Definitions
type DocumentWithId<T> = T & { id: string };

interface UseDocResult<T> {
  data: DocumentWithId<T> | null;
  loading: boolean;
  error: FirestoreError | null;
}

const isMemo = (obj: any): boolean => {
  return typeof obj === 'object' && obj !== null && '__memo' in obj;
};

/**
 * A React hook for subscribing to a single Firestore document in real-time.
 *
 * @template T The type of the document data.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef - A Firestore DocumentReference to listen to. The hook will not run if this is null or undefined.
 * @returns {UseDocResult<T>} An object containing the document data, loading state, and any error.
 *
 * @example
 * // Basic usage with a document reference
 * const firestore = useFirestore();
 * const docRef = useMemoFirebase(() => doc(firestore, 'my-collection', 'my-doc-id'), [firestore]);
 * const { data, loading, error } = useDoc<MyType>(docRef);
 *
 * if (loading) return <p>Loading document...</p>;
 * if (error) return <p>Error: {error.message}</p>;
 * if (!data) return <p>Document not found.</p>;
 *
 * return <h1>{data.title}</h1>;
 */
export const useDoc = <T,>(docRef: DocumentReference<DocumentData> | null | undefined): UseDocResult<T> => {
  const [data, setData] = useState<DocumentWithId<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // If docRef is null/undefined, do nothing.
    if (!docRef) {
      setLoading(false);
      setData(null); // Explicitly set data to null when there's no reference
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe: Unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({
            id: docSnapshot.id,
            ...(docSnapshot.data() as T),
          });
        } else {
          // Document does not exist
          setData(null);
        }
        setLoading(false);
      },
      (err: FirestoreError) => {
        // Do not log the error here, as the listener will throw it.
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);

        setError(err); // Still set local error state for component-level handling
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the listener on component unmount
    return () => unsubscribe();
  }, [docRef]); // Effect dependencies

  return { data, loading, error };
};
