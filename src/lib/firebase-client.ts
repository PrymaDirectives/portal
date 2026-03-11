/**
 * Firebase Client SDK singleton (browser only)
 * Uses the NEXT_PUBLIC_FIREBASE_* env vars from .env
 */
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

function getClientApp(): FirebaseApp {
  const existing = getApps().find((a) => a.name === "[DEFAULT]");
  return existing ?? initializeApp(firebaseConfig);
}

let _auth: Auth | null = null;

export function getClientAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getClientApp());
  }
  return _auth;
}
