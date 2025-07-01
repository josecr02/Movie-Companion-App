import { icons } from '@/constants/icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSavedMovies } from './SavedMoviesContext';
import { Movie } from '@/interfaces/interfaces';


const MovieCard = (movie: Movie) => {
  const { id, poster_path, title, vote_average, release_date } = movie;
  const { saveMovie, unsaveMovie, isMovieSaved } = useSavedMovies();
  const saved = isMovieSaved(id.toString());

  const handleSave = () => {
    if (saved) {
      unsaveMovie(id.toString());
    } else {
      saveMovie(movie);
    }
  };

  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : `https://placehold.co/600x400/1a1a1a/ffffff.png`
          }}
          className="w-full h-52 rounded-lg"
          resizeMode="cover"
        />
        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>{title}</Text>
        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4"/>
          <Text className="text-xs text-white font-bold uppercase">{Math.round(vote_average / 2)}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {release_date?.split('-')[0]}
          </Text>
          <TouchableOpacity onPress={handleSave} className="p-1" hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Image source={icons.save} className="size-4" tintColor={saved ? '#FFD700' : '#fff'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default MovieCard