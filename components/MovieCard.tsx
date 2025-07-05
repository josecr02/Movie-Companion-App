
import { icons } from '@/constants/icons';
import { Movie } from '@/interfaces/interfaces';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSavedMovies } from './SavedMoviesContext';
import { useUserPlatforms } from './UserPlatformsContext';
import { fetchMovieWatchProviders } from '@/services/api';
import { useSharedWatchlists } from './SharedWatchlistsContext';
import SelectWatchlistModal from './SelectWatchlistModal';


const MovieCard = (movie: Movie) => {
  const { id, poster_path, title, vote_average, release_date } = movie;

  const { saveMovie, unsaveMovie, isMovieSaved, favoriteMovie, unfavoriteMovie, isMovieFavorited } = useSavedMovies();
  const saved = isMovieSaved(id.toString());
  const favorited = isMovieFavorited(id.toString());

  // Streaming availability state
  const { selectedPlatforms } = useUserPlatforms();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!selectedPlatforms.length) {
      setIsAvailable(null);
      return;
    }
    setCheckingAvailability(true);
    fetchMovieWatchProviders(id.toString(), 'CA')
      .then((providers) => {
        if (!isMounted) return;
        const hasProvider = providers.some((p: any) => selectedPlatforms.includes(p.provider_id));
        setIsAvailable(hasProvider);
      })
      .catch(() => {
        if (isMounted) setIsAvailable(null);
      })
      .finally(() => {
        if (isMounted) setCheckingAvailability(false);
      });
    return () => { isMounted = false; };
  }, [id, selectedPlatforms]);


  const { watchlists, addMovieToWatchlist } = useSharedWatchlists();
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const handleSave = () => {
    if (saved) {
      unsaveMovie(id.toString());
    } else if (watchlists && watchlists.length > 0) {
      setShowWatchlistModal(true);
    } else {
      saveMovie(movie);
    }
  };

  const handleSelectWatchlist = (watchlistId: string) => {
    if (watchlistId === 'personal') {
      saveMovie(movie);
    } else {
      addMovieToWatchlist(watchlistId, movie);
    }
    setShowWatchlistModal(false);
  };

  // Remove duplicate declaration

  const handleFavorite = () => {
    if (favorited) {
      unfavoriteMovie(id.toString());
    } else {
      favoriteMovie(movie);
    }
  };

  return (
    <>
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
            {checkingAvailability ? (
              <ActivityIndicator size="small" color="#FFD700" style={{ marginLeft: 2 }} />
            ) : isAvailable !== null ? (
              <Image
                source={isAvailable ? icons.green_checkmark_internet : icons.red_crossmark_internet}
                className="size-4"
                style={{ marginLeft: 2 }}
                accessibilityLabel={isAvailable ? 'Available on your platforms' : 'Not available on your platforms'}
              />
            ) : null}
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-light-300 font-medium mt-1">
              {release_date?.split('-')[0]}
            </Text>
            <View className="flex-row items-center gap-x-2">
              <TouchableOpacity onPress={handleFavorite} className="p-1" hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Image source={icons.star} className="size-4" tintColor={favorited ? '#FFD700' : '#fff'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="p-1" hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Image source={icons.save} className="size-4" tintColor={saved ? '#FFD700' : '#fff'} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
      <SelectWatchlistModal
        visible={showWatchlistModal}
        watchlists={[{ id: 'personal', name: 'My Watchlist' }, ...watchlists]}
        onSelect={handleSelectWatchlist}
        onCancel={() => setShowWatchlistModal(false)}
      />
    </>
  );
}

export default MovieCard