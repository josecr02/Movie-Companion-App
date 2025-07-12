import { Databases, ID, Query } from 'react-native-appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const MATCHES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_MATCHES_COLLECTION_ID!;

export interface MatchDoc {
  $id: string;
  users: string[];
  status: 'pending' | 'active' | 'finished';
  initiator: string;
  invitee: string;
  initiator_swipes: string[];
  invitee_swipes: string[];
  current_index: number;
  result_movie_id?: string;
}

export async function createMatch(database: Databases, initiator: string, invitee: string): Promise<MatchDoc> {
  const doc = await database.createDocument(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    ID.unique(),
    {
      users: [initiator, invitee],
      status: 'pending',
      initiator,
      invitee,
      initiator_swipes: [],
      invitee_swipes: [],
      current_index: 0,
    }
  );
  return {
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_swipes: doc.initiator_swipes,
    invitee_swipes: doc.invitee_swipes,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  };
}

export async function acceptMatch(database: Databases, matchId: string): Promise<MatchDoc> {
  const doc = await database.updateDocument(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    matchId,
    {
      status: 'active',
    }
  );
  return {
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_swipes: doc.initiator_swipes,
    invitee_swipes: doc.invitee_swipes,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  };
}

export async function getUserMatches(database: Databases, username: string): Promise<MatchDoc[]> {
  const res = await database.listDocuments(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    [Query.contains('users', username)]
  );
  return res.documents.map(doc => ({
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_swipes: doc.initiator_swipes,
    invitee_swipes: doc.invitee_swipes,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  }));
}

export async function getMatch(database: Databases, matchId: string): Promise<MatchDoc> {
  const doc = await database.getDocument(DATABASE_ID, MATCHES_COLLECTION_ID, matchId);
  return {
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_swipes: doc.initiator_swipes,
    invitee_swipes: doc.invitee_swipes,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  };
}


// submitAnswer is deprecated in infinite swipe mode and should not be used.
// (function removed)



