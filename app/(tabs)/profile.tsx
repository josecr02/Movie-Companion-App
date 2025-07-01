import MovieCard from '@/components/MovieCard'
import { useSavedMovies } from '@/components/SavedMoviesContext'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import React from 'react'
import { FlatList, Image, ScrollView, Text, View } from 'react-native'

//  px-5 pt-10
const Profile = () => {
  const {favoriteMovies} = useSavedMovies(); // Assuming you have a useSavedMovies hook that provides favoriteMovies

  return (
    <View className="bg-primary flex-1"> 
      <Image source={images.bg} className="absolute w-full z-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{
        minHeight: "100%", paddingBottom: 10
      }}>
        <Image source={icons.person} className="size-20 mt-20 mb-5 mx-auto" tintColor="#fff" />
        <View className="items-center mb-8">
          <Text className="text-white text-2xl font-bold mb-1">Jose Cabello</Text>
          <Text className="text-gray-400 text-base">@jcabello</Text>
        </View>

        <Text className="text-white text-lg font-bold mb-3">My All Time Favorites</Text>

        <FlatList
          data={favoriteMovies} // Assuming you have a favoriteMovies array
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
    </View>
  )
}

export default Profile