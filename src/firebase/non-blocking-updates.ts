'use client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  setDoc,
  SetOptions,
  updateDoc,
  WithFieldValue,
  PartialWithFieldValue,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * A non-blocking wrapper for Firestore's `setDoc` function that handles permission errors.
 * It does not `await` the operation but catches and emits potential errors.
 *
 * @param {DocumentReference<T>} docRef - The reference to the document.
 * @param {WithFieldValue<T>} data - The data to write to the document.
 * @param {SetOptions} [options] - Optional settings for the set operation (e.g., merge).
 */
export const setDocumentNonBlocking = <T extends DocumentData>(
  docRef: DocumentReference<T>,
  data: WithFieldValue<T>,
  options?: SetOptions
) => {
  const operation = options && 'merge' in options ? 'update' : 'create';
  setDoc(docRef, data, options || {})
    .catch((serverError: any) => {
      console.error(`[setDocumentNonBlocking] Firestore error on path ${docRef.path}:`, serverError);
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation,
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

/**
 * A non-blocking wrapper for Firestore's `addDoc` function that handles permission errors.
 *
 * @param {CollectionReference<T>} collectionRef - The reference to the collection.
 * @param {WithFieldValue<T>} data - The data for the new document.
 */
export const addDocumentNonBlocking = <T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  data: WithFieldValue<T>
) => {
  addDoc(collectionRef, data)
    .catch((serverError: any) => {
      console.error(`[addDocumentNonBlocking] Firestore error on path ${collectionRef.path}:`, serverError);
      const permissionError = new FirestorePermissionError({
        path: collectionRef.path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};


/**
 * A non-blocking wrapper for Firestore's `updateDoc` function that handles permission errors.
 *
 * @param {DocumentReference<T>} docRef - The reference to the document.
 * @param {PartialWithFieldValue<T>} data - An object containing the fields and values with which to update the document.
 */
export const updateDocumentNonBlocking = <T extends DocumentData>(
  docRef: DocumentReference<T>,
  data: PartialWithFieldValue<T>
) => {
  updateDoc(docRef, data)
    .catch((serverError: any) => {
      console.error(`[updateDocumentNonBlocking] Firestore error on path ${docRef.path}:`, serverError);
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

/**
 * A non-blocking wrapper for Firestore's `deleteDoc` function that handles permission errors.
 *
 * @param {DocumentReference<any>} docRef - The reference to the document to delete.
 */
export const deleteDocumentNonBlocking = (docRef: DocumentReference) => {
  deleteDoc(docRef)
    .catch((serverError: any) => {
      console.error(`[deleteDocumentNonBlocking] Firestore error on path ${docRef.path}:`, serverError);
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};
