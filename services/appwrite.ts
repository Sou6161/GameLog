import { Client, Account, Databases, Storage, Functions } from 'appwrite';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject('your-project-id'); // Your Appwrite Project ID

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and Collection IDs
export const DATABASE_ID = 'gamelog-db';
export const COLLECTIONS = {
  USERS: 'users',
  GAMES: 'games',
  STATUSES: 'statuses',
  DIARY: 'diary',
  REVIEWS: 'reviews',
  LISTS: 'lists',
  LIST_ENTRIES: 'listEntries',
  FOLLOWS: 'follows',
};

export default client;