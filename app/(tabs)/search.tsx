import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'
import { images } from '@/constants/images'
import { fetchMovies, fetchMovieWatchProviders } from '@/services/api'
import { updateSearchCount } from '@/services/appwrite'
import useFetch from '@/services/useFetch'
import React, { useEffect, useState } from 'react'
import { useUserPlatforms } from '@/components/UserPlatformsContext';
import { useSavedMovies } from '@/components/SavedMoviesContext';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyPlatforms, setOnlyMyPlatforms] = useState(false);
  const { selectedPlatforms, loading: loadingPlatforms } = useUserPlatforms();
  const { data: movies, loading, error, refetch: loadMovies, reset} = useFetch(() => fetchMovies({
    query: searchQuery
  }), false) // false for no auto fetch




  // we debounce, by wrapping in a time out function!
  useEffect(() => {
    
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset()
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (movies?.length > 0 && movies?.[0])
      updateSearchCount(searchQuery, movies[0]);
  }, [movies])

  // Helper to filter movies by user's platforms
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  useEffect(() => {
    if (!onlyMyPlatforms || !movies || selectedPlatforms.length === 0) {
      setFilteredMovies(movies || []);
      return;
    }
    let isMounted = true;
    (async () => {
      const results = await Promise.all(
        movies.map(async (movie: any) => {
          const providers = await fetchMovieWatchProviders(movie.id, 'CA');
          const hasProvider = providers.some((p: any) => selectedPlatforms.includes(p.provider_id));
          return hasProvider ? movie : null;
        })
      );
      if (isMounted) setFilteredMovies(results.filter(Boolean));
    })();
    return () => { isMounted = false; };
  }, [onlyMyPlatforms, movies, selectedPlatforms]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover"/>
      <FlatList
        data={onlyMyPlatforms ? filteredMovies : movies}
        renderItem={({item}) => <MovieCard {... item} />}
        keyExtractor={(item) => item.id.toString()}
        className='px-5'
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'center',
          gap: 16,
          marginVertical: 16
        }}
        contentContainerStyle={{paddingBottom: 100}}
        ListHeaderComponent={
          <>
            <View className='my-5'>
              <SearchBar placeholder='Search movies'
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {/* Available On My Platforms toggle */}
            <View className="flex-row items-center mb-4 px-2">
              <Text className="text-white mr-2 text-base font-semibold">Available On My Platforms</Text>
              <View style={{ borderWidth: 2, borderColor: onlyMyPlatforms ? '#FFD700' : '#A8B5DB', borderRadius: 16, padding: 2 }}>
                <Text
                  onPress={() => setOnlyMyPlatforms((v) => !v)}
                  style={{ color: onlyMyPlatforms ? '#FFD700' : '#A8B5DB', fontWeight: 'bold', fontSize: 14, paddingHorizontal: 12, paddingVertical: 2 }}
                >{onlyMyPlatforms ? 'ON' : 'OFF'}</Text>
              </View>
              {loadingPlatforms && (
                <ActivityIndicator size="small" color="#FFD700" style={{ marginLeft: 8 }} />
              )}
            </View>
            {loading && (
              <ActivityIndicator size="large" color="#0000ff" className="my-3" />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3">Error: {error.message}</Text>
            )}
            {!loading && !error && searchQuery.trim() && (onlyMyPlatforms ? filteredMovies : movies)?.length > 0 && (
              <Text className="text-white text-xl font-bold">
                Search Results for {''}
                <Text className="text-accent">{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim() ? 'No movies found' : 'Search for a movie'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default Search