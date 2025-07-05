import { Movie } from '@/interfaces/interfaces';

const API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Fetch a page of popular movies (or with a random page)
export async function fetchRandomPopularMovieIds(count: number): Promise<string[]> {
  // TMDb popular endpoint has 500 pages, each with 20 movies
  const maxPages = 500;
  const ids = new Set<string>();
  let attempts = 0;
  while (ids.size < count && attempts < count * 3) {
    const page = Math.floor(Math.random() * maxPages) + 1;
    const res = await fetch(`${BASE_URL}/movie/popular?page=${page}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) break;
    const data = await res.json();
    if (data && data.results) {
      for (const movie of data.results) {
        ids.add(movie.id.toString());
        if (ids.size >= count) break;
      }
    }
    attempts++;
  }
  return Array.from(ids).slice(0, count);
}
