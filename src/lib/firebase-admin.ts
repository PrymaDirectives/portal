/**
 * Firebase Admin SDK singleton
 * Uses FIREBASE_SERVICE_ACCOUNT_KEY (base64 JSON) in local dev.
 * In Cloud Run, leave the env var unset — ADC attaches the runtime SA automatically.
 */
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

function createAdminApp(): App {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) {
    // Local dev: base64-encoded JSON service account
    const serviceAccount = JSON.parse(
      Buffer.from(key, "base64").toString("utf-8")
    ) as object;
    return initializeApp({
      credential: cert(serviceAccount as Parameters<typeof cert>[0]),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  // Cloud Run: Application Default Credentials (attached service account)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === "[DEFAULT]");
  return existing ?? createAdminApp();
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
