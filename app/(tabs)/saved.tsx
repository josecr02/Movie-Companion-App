
import MovieCard from '@/components/MovieCard'
import { useSavedMovies } from '@/components/SavedMoviesContext'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import React from 'react'
import { FlatList, Image, ScrollView, Text, View } from 'react-native'


const Saved = () => {
  const { savedMovies } = useSavedMovies();

  return (
    <View className="bg-primary flex-1 ">
      <Image source={images.bg} className="absolute w-full z-0"/>
      {savedMovies.length === 0 ? (
        <View className="flex-1 justify-center items-center flex-col gap-5">
          <Image source={icons.save} className="size-10" tintColor="#fff" />
          <Text className="text-gray-500 text-base">No saved movies yet.</Text>
        </View>
      ) : (
          <ScrollView className="flex-1 px-5 pt-10" showsVerticalScrollIndicator={false}>
            <Text className="text-xl text-white font-bold mt-5 mb-3">My Watchlist</Text>
            <FlatList
              data={savedMovies}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              renderItem={({ item }) => <MovieCard {...item} />}
              columnWrapperStyle={{
                  justifyContent: 'flex-start',
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10
                }}
              className="mt-2 pb-32"
              scrollEnabled={false}
            />
        </ScrollView>
      )}
    </View>
  );
}

export default Saved