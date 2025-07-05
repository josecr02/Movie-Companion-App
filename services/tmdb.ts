import { Movie } from '@/interfaces/interfaces';

const API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchMovieById(id: string): Promise<Movie | null> {
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchMoviesByIds(ids: string[]): Promise<Movie[]> {
  const results: Movie[] = [];
  for (const id of ids) {
    const movie = await fetchMovieById(id);
    if (movie) results.push(movie);
  }
  return results;
}
