/**
 * Creates (or fetches) an Email/Password admin user in Firebase Auth.
 * Called by setup-firebase.ps1 — not meant to be run directly.
 *
 * Usage: node scripts/create-admin-user.mjs <email> <password> <base64ServiceAccountKey>
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [, , email, password, b64Key] = process.argv;

if (!email || !password || !b64Key) {
  console.error("Usage: node create-admin-user.mjs <email> <password> <base64key>");
  process.exit(1);
}

// Decode the base64 service account key
const serviceAccount = JSON.parse(Buffer.from(b64Key, "base64").toString("utf8"));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const auth = getAuth();

try {
  // Check if user already exists
  const existing = await auth.getUserByEmail(email).catch(() => null);

  if (existing) {
    // Update password in case it changed
    await auth.updateUser(existing.uid, { password });
    console.log(`  ✓ Admin user updated: ${email}  (uid: ${existing.uid})`);
  } else {
    const user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      displayName: "Admin",
    });
    console.log(`  ✓ Admin user created: ${email}  (uid: ${user.uid})`);
  }
} catch (err) {
  console.error(`  ✗ Failed to create/update user: ${err.message}`);
  process.exit(1);
}
