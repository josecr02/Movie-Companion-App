import { Databases, ID, Query } from 'react-native-appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const WATCHLISTS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_WATCHLISTS_COLLECTION_ID!;

export interface WatchlistDoc {
  $id: string;
  name: string;
  members: string[];
  movies_ids: string[];
}

export async function fetchWatchlists(database: Databases, username: string): Promise<WatchlistDoc[]> {
  // Fetch all watchlists where the user is a member
  const res = await database.listDocuments(
    DATABASE_ID,
    WATCHLISTS_COLLECTION_ID,
    [Query.contains('members', username)]
  );
  return res.documents.map(doc => ({
    $id: doc.$id,
    name: doc.name,
    members: doc.members,
    movies_ids: doc.movies_ids,
  }));
}

export async function createWatchlist(database: Databases, name: string, creator: string): Promise<WatchlistDoc> {
  const doc = await database.createDocument(
    DATABASE_ID,
    WATCHLISTS_COLLECTION_ID,
    ID.unique(),
    {
      name,
      members: [creator],
      movies_ids: [],
    }
  );
  return {
    $id: doc.$id,
    name: doc.name,
    members: doc.members,
    movies_ids: doc.movies_ids,
  };
}

export async function addMemberToWatchlist(database: Databases, watchlistId: string, username: string): Promise<WatchlistDoc> {
  // Fetch current doc
  const doc = await database.getDocument(DATABASE_ID, WATCHLISTS_COLLECTION_ID, watchlistId);
  if (doc.members.includes(username)) return {
    $id: doc.$id,
    name: doc.name,
    members: doc.members,
    movies_ids: doc.movies_ids,
  };
  const updated = await database.updateDocument(
    DATABASE_ID,
    WATCHLISTS_COLLECTION_ID,
    watchlistId,
    { members: [...doc.members, username] }
  );
  return {
    $id: updated.$id,
    name: updated.name,
    members: updated.members,
    movies_ids: updated.movies_ids,
  };
}

export async function addMovieToWatchlist(database: Databases, watchlistId: string, movieId: string): Promise<WatchlistDoc> {
  const doc = await database.getDocument(DATABASE_ID, WATCHLISTS_COLLECTION_ID, watchlistId);
  if (doc.movies_ids.includes(movieId)) return {
    $id: doc.$id,
    name: doc.name,
    members: doc.members,
    movies_ids: doc.movies_ids,
  };
  const updated = await database.updateDocument(
    DATABASE_ID,
    WATCHLISTS_COLLECTION_ID,
    watchlistId,
    { movies_ids: [...doc.movies_ids, movieId] }
  );
  return {
    $id: updated.$id,
    name: updated.name,
    members: updated.members,
    movies_ids: updated.movies_ids,
  };
}
