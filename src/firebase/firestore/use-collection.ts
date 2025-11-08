'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  DocumentReference,
  Query,
  Unsubscribe,
  DocumentData,
  CollectionReference,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Type Definitions
type DocumentWithId<T> = T & { id: string };

interface UseCollectionOptions<T> {
  // onData: (data: DocumentWithId<T>[]) => void;
  // onError: (error: FirestoreError) => void;
}

interface UseCollectionResult<T> {
  data: DocumentWithId<T>[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

const isMemo = (obj: any): boolean => {
  return typeof obj === 'object' && obj !== null && '__memo' in obj;
};

/**
 * A React hook for subscribing to a Firestore collection in real-time.
 *
 * @template T - The type of the documents in the collection.
 * @param {Query<DocumentData> | CollectionReference<DocumentData> | null | undefined} queryOrRef - A Firestore Query or CollectionReference to listen to. The hook will not run if this is null or undefined.
 * @returns {UseCollectionResult<T>} An object containing the collection data, loading state, and any error.
 *
 * @example
 * // Basic usage with a collection reference
 * const { data, loading, error } = useCollection<MyType>(collection(firestore, 'my-collection'));
 *
 * @example
 * // Usage with a query
 * const q = query(collection(firestore, 'items'), where('isPublic', '==', true));
 * const { data: publicItems } = useCollection<Item>(q);
 *
 * @example
 * // Memoized query to prevent re-renders
 * const userItemsQuery = useMemoFirebase(() => {
 *   if (!firestore || !userId) return null;
 *   return collection(firestore, 'users', userId, 'items');
 * }, [firestore, userId]);
 * const { data: userItems } = useCollection(userItemsQuery);
 */
export const useCollection = <T,>(
  queryOrRef: Query<DocumentData> | CollectionReference<DocumentData> | null | undefined
): UseCollectionResult<T> => {
  const [data, setData] = useState<DocumentWithId<T>[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // If queryOrRef is null/undefined, do nothing.
    if (!queryOrRef) {
      setLoading(false);
      setData(null); // Explicitly set data to null when there's no query
      return;
    }

    if (!isMemo(queryOrRef)) {
      console.warn(
        `[use-collection] Unstable query/reference passed to useCollection hook. Use useMemoFirebase to prevent unnecessary re-renders.`
      );
    }

    setLoading(true);
    setError(null);

    const unsubscribe: Unsubscribe = onSnapshot(
      queryOrRef,
      (querySnapshot) => {
        const documents: DocumentWithId<T>[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as T,
        }));
        setData(documents);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error(`[use-collection] Error listening to collection at path: ${queryOrRef.path}. `, err);
        const permissionError = new FirestorePermissionError({
          path: (queryOrRef as CollectionReference).path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the listener on component unmount
    return () => unsubscribe();
  }, [queryOrRef]); // Effect dependencies

  return { data, loading, error };
};
