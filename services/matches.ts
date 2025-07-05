import { Databases, ID, Query } from 'react-native-appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const MATCHES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_MATCHES_COLLECTION_ID!;

export interface MatchDoc {
  $id: string;
  users: string[];
  status: 'pending' | 'active' | 'finished';
  initiator: string;
  invitee: string;
  initiator_movies: string[];
  invitee_movies: string[];
  initiator_answers: string[];
  invitee_answers: string[];
  current_index: number;
  result_movie_id?: string;
}

export async function createMatch(database: Databases, initiator: string, invitee: string, initiator_movies: string[]): Promise<MatchDoc> {
  const doc = await database.createDocument(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    ID.unique(),
    {
      users: [initiator, invitee],
      status: 'pending',
      initiator,
      invitee,
      initiator_movies,
      invitee_movies: [],
      initiator_answers: [],
      invitee_answers: [],
      current_index: 0,
    }
  );
  return {
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_movies: doc.initiator_movies,
    invitee_movies: doc.invitee_movies,
    initiator_answers: doc.initiator_answers,
    invitee_answers: doc.invitee_answers,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  };
}

export async function acceptMatch(database: Databases, matchId: string, invitee_movies: string[]): Promise<MatchDoc> {
  const doc = await database.updateDocument(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    matchId,
    {
      status: 'active',
      invitee_movies,
    }
  );
  return {
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_movies: doc.initiator_movies,
    invitee_movies: doc.invitee_movies,
    initiator_answers: doc.initiator_answers,
    invitee_answers: doc.invitee_answers,
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
    initiator_movies: doc.initiator_movies,
    invitee_movies: doc.invitee_movies,
    initiator_answers: doc.initiator_answers,
    invitee_answers: doc.invitee_answers,
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
    initiator_movies: doc.initiator_movies,
    invitee_movies: doc.invitee_movies,
    initiator_answers: doc.initiator_answers,
    invitee_answers: doc.invitee_answers,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  };
}

export async function submitAnswer(database: Databases, matchId: string, username: string, answer: string): Promise<MatchDoc> {
  const match = await getMatch(database, matchId);
  let field = '';
  let answers: string[] = [];
  if (username === match.initiator) {
    field = 'initiator_answers';
    answers = [...match.initiator_answers, answer];
  } else {
    field = 'invitee_answers';
    answers = [...match.invitee_answers, answer];
  }
  const doc = await database.updateDocument(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    matchId,
    { [field]: answers, current_index: match.current_index + 1 }
  );
  return {
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_movies: doc.initiator_movies,
    invitee_movies: doc.invitee_movies,
    initiator_answers: doc.initiator_answers,
    invitee_answers: doc.invitee_answers,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  };
}

export async function finishMatch(database: Databases, matchId: string, result_movie_id: string): Promise<MatchDoc> {
  const doc = await database.updateDocument(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    matchId,
    { status: 'finished', result_movie_id }
  );
  return {
    $id: doc.$id,
    users: doc.users,
    status: doc.status,
    initiator: doc.initiator,
    invitee: doc.invitee,
    initiator_movies: doc.initiator_movies,
    invitee_movies: doc.invitee_movies,
    initiator_answers: doc.initiator_answers,
    invitee_answers: doc.invitee_answers,
    current_index: doc.current_index,
    result_movie_id: doc.result_movie_id,
  };
}
