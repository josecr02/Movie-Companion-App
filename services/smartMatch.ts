import { Movie } from '@/interfaces/interfaces';

const API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Fetch genres for a list of movie IDs
export async function fetchGenresForMovies(ids: string[]): Promise<number[]> {
  const genreCounts: Record<number, number> = {};
  for (const id of ids) {
    const res = await fetch(`${BASE_URL}/movie/${id}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) continue;
    const movie = await res.json();
    if (movie.genres) {
      for (const genre of movie.genres) {
        genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1;
      }
    }
  }
  // Return top 2 genres
  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => Number(id));
}

// Discover a movie by genre(s), excluding a list of IDs
export async function discoverMovieByGenres(genres: number[], excludeIds: string[]): Promise<Movie | null> {
  const genreParam = genres.join(',');
  let page = 1;
  while (page <= 5) { // Try up to 5 pages
    const res = await fetch(`${BASE_URL}/discover/movie?with_genres=${genreParam}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.results) {
      const filtered = data.results.filter((m: any) => !excludeIds.includes(m.id.toString()));
      if (filtered.length > 0) {
        return filtered[0];
      }
    }
    page++;
  }
  return null;
}
