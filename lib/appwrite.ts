// lib/appwrite.ts
import { Client, Account, ID } from 'react-native-appwrite';

export const appwrite = {
  client: new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68b0097200050372bc5c')
    .setPlatform('com.company.gamelog'), // must match the bundleId/appId you've added in Appwrite Console

  account: undefined as unknown as Account,
};

appwrite.account = new Account(appwrite.client);

// Helpers
export async function getCurrentUserSafe() {
  try {
    return await appwrite.account.get(); // throws if not logged in
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  // If a session already exists, return the current user instead of creating a new session
  const existing = await getCurrentUserSafe();
  if (existing) return existing;
  await appwrite.account.createEmailPasswordSession(email, password);
  return await appwrite.account.get();
}

export async function register(email: string, password: string, name: string) {
  await appwrite.account.create(ID.unique(), email, password, name);
  await appwrite.account.createEmailPasswordSession(email, password);
  return await appwrite.account.get();
}

export async function logout() {
  try { await appwrite.account.deleteSession('current'); } catch {}
}
