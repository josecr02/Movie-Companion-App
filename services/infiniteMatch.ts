import { Databases } from 'react-native-appwrite';
import { fetchMoviesByIds } from './tmdb';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const MATCHES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_MATCHES_COLLECTION_ID!;

export async function submitSwipe(database: Databases, matchId: string, username: string, movieId: string, direction: 'left' | 'right', initiator: string, invitee: string) {
  // Only store right swipes
  if (direction !== 'right') return;
  const match = await database.getDocument(DATABASE_ID, MATCHES_COLLECTION_ID, matchId);
  let field = '';
  if (username === initiator) field = 'initiator_swipes';
  else if (username === invitee) field = 'invitee_swipes';
  else return;
  const swipes = match[field] || [];
  if (!swipes.includes(movieId)) {
    swipes.push(movieId);
    await database.updateDocument(
      DATABASE_ID,
      MATCHES_COLLECTION_ID,
      matchId,
      { [field]: swipes }
    );
  }
}

export async function getSwipes(database: Databases, matchId: string) {
  const match = await database.getDocument(DATABASE_ID, MATCHES_COLLECTION_ID, matchId);
  return {
    initiator_swipes: match.initiator_swipes || [],
    invitee_swipes: match.invitee_swipes || []
  };
}

export async function finishInfiniteMatch(database: Databases, matchId: string, movieId: string) {
  await database.updateDocument(
    DATABASE_ID,
    MATCHES_COLLECTION_ID,
    matchId,
    { status: 'finished', result_movie_id: movieId }
  );
}

// 1. Initialize session (ensure swipes object exists)
export async function initSession(matchId: string, users: string[], initiator: string, invitee: string) {
  const db = getDatabase();
  const match = await db.getDocument(DATABASE_ID, MATCHES_COLLECTION_ID, matchId);
  const update: any = {};
  if (!match.initiator_swipes) update.initiator_swipes = [];
  if (!match.invitee_swipes) update.invitee_swipes = [];
  if (Object.keys(update).length > 0) {
    await db.updateDocument(DATABASE_ID, MATCHES_COLLECTION_ID, matchId, update);
  }
}

// 2. Deterministic infinite movie list (seeded by matchId)
function seededRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return function() {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// 3. Get movies for session (deterministic, infinite)
export async function getMoviesForSession(matchId: string, start: number, count: number) {
  // Use TMDb's 500 pages of popular movies, 20 per page
  const maxPages = 500;
  const pageSize = 20;
  const rand = seededRandom(matchId);
  const ids: Set<string> = new Set();
  let i = 0;
  while (ids.size < start + count && i < (start + count) * 3) {
    const page = Math.floor(rand() * maxPages) + 1;
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) break;
    const data = await res.json();
    if (data && data.results) {
      for (const movie of data.results) {
        ids.add(movie.id.toString());
        if (ids.size >= start + count) break;
      }
    }
    i++;
  }
  const allIds = Array.from(ids).slice(start, start + count);
  return await fetchMoviesByIds(allIds);
}

// 4. Check for a match (both users swiped right on same movie at any index)
export async function checkForMatch(matchId: string) {
  const db = getDatabase();
  const match = await db.getDocument(DATABASE_ID, MATCHES_COLLECTION_ID, matchId);
  if (!match.initiator_swipes || !match.invitee_swipes) return null;
  const intersection = match.initiator_swipes.find((id: string) => match.invitee_swipes.includes(id));
  if (intersection) {
    const [movie] = await fetchMoviesByIds([intersection]);
    await finishInfiniteMatch(db, matchId, intersection);
    return { movie };
  }
  return null;
}

// Helper to get the Appwrite database instance
import { database } from './appwrite';
function getDatabase(): Databases {
  return database;
}
