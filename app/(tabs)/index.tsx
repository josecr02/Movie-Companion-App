
import MovieCard from "@/components/MovieCard";
import { useSavedMovies } from "@/components/SavedMoviesContext";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovieRecommendations, fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";
// Custom hook to fetch recommended movies based on favorites
function useRecommendedMovies() {
  const { favoriteMovies } = useSavedMovies();
  const [recommended, setRecommended] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!favoriteMovies || favoriteMovies.length === 0) {
      setRecommended([]);
      return;
    }
    let isMounted = true;
    setLoading(true);
    setError(null);
    // Fetch recommendations for each favorite movie
    Promise.all(
      favoriteMovies.map((fav) =>
        fetchMovieRecommendations(fav.id).catch(() => [])
      )
    )
      .then((results) => {
        // Flatten, deduplicate by id
        const all = results.flat();
        const unique = all.filter(
          (movie: any, idx: number, arr: any[]) => arr.findIndex((m: any) => m.id === movie.id) === idx
        );
        // Remove movies already in favorites
        const filtered = unique.filter(
          (movie: any) => !favoriteMovies.some((fav: any) => fav.id === movie.id)
        );
        if (isMounted) setRecommended(filtered);
      })
      .catch((e) => {
        if (isMounted) setError(e);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [favoriteMovies]);
  return { recommended, loading, error };
}

// RecommendedMoviesSection component
function RecommendedMoviesSection() {
  const { recommended, loading, error } = useRecommendedMovies();
  if (loading) return <ActivityIndicator size="small" color="#fff" className="mt-6 mb-8" />;
  if (error) return <Text className="text-light-200 mt-6 mb-8">Error loading recommendations.</Text>;
  if (!recommended || recommended.length === 0) return null;
  return (
    <View className="mt-8 mb-10">
      <Text className="text-lg text-white font-bold mb-3">Recommended Movies</Text>
      <FlatList

        ItemSeparatorComponent={() => <View className="w-4" />}
        data={recommended}
        renderItem={({ item }) => (
          <MovieCard
            {...item}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          gap: 20,
          paddingRight: 5,
          marginBottom: 10
        }}
        className="mt-2"
        scrollEnabled={false}
      />
    </View>
  );
}


export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError
  } = useFetch(getTrendingMovies);

  const {data: movies, loading: moviesLoading, error: moviesError} = useFetch(() => fetchMovies({
    query: ''
  }))

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{
        minHeight: "100%", paddingBottom: 10}}>
          <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"/>
          {moviesLoading || trendingLoading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              className="mt-10 self-center"
            />
          ) : moviesError || trendingError ? (
            <Text>Error: {moviesError?.message || trendingError?.message}</Text>
          ) : (
            <View className="flex-1 mt-5">
              <SearchBar
                onPress={() => router.push("/search")}
                placeholder="Search for a movie"
              />

              {trendingMovies && (
                <View className="mt-10">
                  <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
                </View>
              )}

              {/* Trending Movies */}
              <FlatList 
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4"/>}
                className="mb-4 mt-3"
                data={trendingMovies}
                renderItem={({item, index}) => (
                  <TrendingCard movie={item} index={index}/>
                )}
                keyExtractor={(item) => item.movie_id.toString()}
              />

              <Text className="text-lg text-white font-bold mt-5 mb-3">Latest movies</Text>

              <FlatList
                data={movies}
                renderItem={({item}) => (
                  <MovieCard
                    {... item}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: 'flex-start',
                  gap:20,
                  paddingRight: 5, 
                  marginBottom: 10
                }}
                className="mt-2"
                scrollEnabled={false}
              />

              {/* Recommended Movies Section */}
              <RecommendedMoviesSection />
            </View>
          )}
      </ScrollView>
    </View>
  );
}
