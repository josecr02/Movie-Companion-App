

import CinemaCard from '@/components/CinemaCard';
import { fetchMovies } from '@/services/api';
import useFetch from '@/services/useFetch';
import { images } from '@/constants/images';
import React from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';

const InTheatres = () => {
  // Fetch movies currently in theatres (now_playing)
  const { data: movies, loading, error } = useFetch(() => fetchMovies({ query: '', nowPlaying: true }));

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover" />
      <View className="flex-1 pt-10">
        <Text className="text-white text-2xl font-bold mb-4 px-5">Now Playing in Theatres</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text className="text-red-500 px-5 mt-10">Error: {error.message}</Text>
        ) : (
          <FlatList
            data={movies}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <CinemaCard {...item} />}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
            ItemSeparatorComponent={() => <View style={{ width: 24 }} />}
            style={{ flexGrow: 0, marginTop: 10 }}
          />
        )}
      </View>
    </View>
  );
};

export default InTheatres;
