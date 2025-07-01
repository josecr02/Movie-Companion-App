import { useSavedMovies } from '@/components/SavedMoviesContext';
import { icons } from '@/constants/icons';
import { fetchMovieDetails, fetchMovieWatchProviders } from '@/services/api';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MovieInfoProps {
  label: string,
  value?: string | number | null;
}

const MovieInfo = ({label, value}: MovieInfoProps) =>  (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">{value || 'N/A'}</Text>
  </View>
)

const MovieDetails = () => {
  const {id} = useLocalSearchParams();

  const {data: movie, loading} = useFetch(() =>
    fetchMovieDetails(id as string));
  const {data: providers, loading: loadingProviders} = useFetch(() =>
    fetchMovieWatchProviders(id as string, 'CA'), !!id);
  const { saveMovie, unsaveMovie, isMovieSaved } = useSavedMovies();
  
  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{
        paddingBottom: 80
      }}>
        <View>
          <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className="w-full h-[550px]" resizeMode='stretch'/>
        </View>
        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">{movie?.release_date?.split('-')[0]}</Text>
            <Text className='text-light-200 text-sm'>{movie?.runtime}m</Text>
          </View>

          <View className='flex-row items-center gap-x-2 mt-2'>
            <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1'>
              <Image source={icons.star} className='size-4'/>
              <Text className="text-white font-bold text-sm">
                {Math.round(movie?.vote_average ?? 0)}/10
              </Text>
              <Text className="text-light-200 text-sm">
                ({movie?.vote_count} votes)
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!movie) return;
                if (isMovieSaved(movie.id.toString())) {
                  unsaveMovie(movie.id.toString());
                } else {
                  // Save only the fields needed for the watchlist
                  saveMovie({
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    release_date: movie.release_date,
                    // fallback for other fields if needed
                  } as any);
                }
              }}
              className="ml-2 px-3 py-1 bg-accent rounded-md flex-row items-center"
            >
              <Image source={icons.save} className="size-4 mr-1" tintColor={isMovieSaved(movie?.id?.toString()) ? '#FFD700' : '#fff'} />
              <Text className="text-white text-xs font-semibold">
                {isMovieSaved(movie?.id?.toString()) ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>


          {/* Where to Watch Section */}
          <View className="mt-5 w-full">
            <Text className="text-white font-semibold text-base mb-2">Where to Watch</Text>
            {loadingProviders ? (
              <Text className="text-light-200">Loading...</Text>
            ) : providers && providers.length > 0 ? (
              <FlatList
                data={providers}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(provider) => provider.provider_id.toString()}
                renderItem={({ item: provider }) => (
                  <View className="items-center mr-4">
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}` }}
                      className="w-10 h-10 rounded-full mb-1"
                      resizeMode="contain"
                    />
                    <Text className="text-xs text-white text-center w-16" numberOfLines={2}>{provider.provider_name}</Text>
                  </View>
                )}
                contentContainerStyle={{ alignItems: 'center' }}
              />
            ) : (
              <Text className="text-light-200">Not available for streaming in Canada</Text>
            )}
          </View>

          <MovieInfo label="Overview" value={movie?.overview}/>

          <MovieInfo label="Genres" value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'} />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo label="Budget" value={`$${movie?.budget / 1_000_000} million`}/>
            <MovieInfo label="Revenue" value={`$${Math.round(movie?.revenue / 1_000_000)} million`} />
          </View>

          <MovieInfo label="Production Companies" 
            value={movie?.production_companies.map((c) => c.name).join(' - ') || 'N/A'}/>

        </View>
      </ScrollView>

      <TouchableOpacity className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center
          justify-center z-50" onPress={router.back}>
        <Image source={icons.arrow} className="size-5 mr-1 mt-0.5 rotate-180" tintColor="#fff" />
        <Text className='text-white font-semibold text-base'>Go back</Text>
      </TouchableOpacity>

    </View>
  )
}

export default MovieDetails