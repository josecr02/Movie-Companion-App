// Fetch the trailer for a movie (YouTube)
export const fetchMovieTrailer = async (movieId: string) => {
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_CONFIG.API_KEY}`,
        { headers: TMDB_CONFIG.headers }
    );
    if (!response.ok) throw new Error('Failed to fetch trailer');
    const data = await response.json();
    // Find the first YouTube trailer
    return data.results.find(
        (video: any) => video.site === 'YouTube' && video.type === 'Trailer'
    );
};

export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
    }
}

// Fetch where to watch info for a movie (providers)
export const fetchMovieWatchProviders = async (movieId: string, countryCode: string = 'US') => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_CONFIG.API_KEY}`,
            {
                method: 'GET',
                headers: TMDB_CONFIG.headers,
            }
        );
        if (!response.ok) throw new Error('Failed to fetch watch providers');
        const data = await response.json();
        // Return only the providers for the given country code
        return data.results?.[countryCode]?.flatrate || [];
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const fetchMovies = async ({ query }: {query: string}) => {
    const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: TMDB_CONFIG.headers,
    });

    if(!response.ok) {
        throw new Error('Failed to fetch movies', response.statusText);
    }

    const data = await response.json();

    return data.results;
} // CUSTOM HOOK, 1.19!!!

export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
    try {
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`, 
            {
                method: 'GET',
                headers: TMDB_CONFIG.headers,
            }
        );

        if (!response.ok) throw new Error('Failed to fetch movie details');

        const data = await response.json();

        return data;

    } catch(error){
        console.log(error);
        throw error;
    }
}





// const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
// const options = {
//     method: 'GET',
//     headers: {
//         accept: 'application/json',
//         Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMDNhMTU5YjUzODUzNzQ5YzBlNDI3NWRhMGI2NWFhOCIsIm5iZiI6MTc1MTIxNTIxMy43OTYsInN1YiI6IjY4NjE2YzZkNTZlM2RlMTA0ZDIyOTgwZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Fc4gRcf-Y_Kcn3HqJup2oDAVvkZXldSfuF4l_qfik1Q'
//     }
// };

// fetch(url, options)
//     .then(res => res.json())
//     .then(json => console.log(json))
//     .catch(err => console.error(err));