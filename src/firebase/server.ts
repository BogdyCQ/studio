// This is a server-only file.
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { firebaseConfig } from './config';

/**
 * Initializes the Firebase Admin SDK, but only if it hasn't been initialized already.
 * This is safe to call from any server-side function.
 * @returns The initialized Firebase Admin App instance.
 */
export function initializeServerFirebase(): App {
  // Check if an app has already been initialized.
  if (getApps().length) {
    return getApps()[0];
  }

  // If no app is initialized, create a new one.
  // We use service account credentials from environment variables.
  // This is a secure way to authenticate in server environments.
  const serviceAccount = {
    projectId: process.env.PROJECT_ID || firebaseConfig.projectId,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'), // Important for Vercel/Netlify
  };

  return initializeApp({
    credential: cert(serviceAccount),
  });
}
