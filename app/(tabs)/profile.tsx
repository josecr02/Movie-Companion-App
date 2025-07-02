import MovieCard from '@/components/MovieCard'
import { useSavedMovies } from '@/components/SavedMoviesContext'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchAllMovieProviders } from '@/services/api'
import useFetch from '@/services/useFetch'
import React, { useState, useEffect } from 'react'
import { useUserPlatforms } from '@/components/UserPlatformsContext';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from 'react-native'

//  px-5 pt-10
const Profile = () => {
  const {favoriteMovies} = useSavedMovies();


  // Fetch platforms from TMDb
  const { data: platforms, loading: loadingProviders, error: errorPlatforms } = useFetch(() => fetchAllMovieProviders('CA'));

  const { selectedPlatforms, setSelectedPlatforms, loading: loadingUserPlatforms } = useUserPlatforms();



  const togglePlatform = (id: number) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter((pid) => pid !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

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


        <Text className="text-white text-lg font-bold mb-3">My Streaming Platforms</Text>
        {(loadingUserPlatforms || loadingProviders) && (
          <ActivityIndicator size="small" color="#FFD700" style={{ marginBottom: 8 }} />
        )}
        <View className="mb-6">
          {(loadingUserPlatforms || loadingProviders) ? (
            <ActivityIndicator size="small" color="#FFD700" />
          ) : errorPlatforms ? (
            <Text className="text-red-400">Failed to load platforms.</Text>
          ) : platforms && Array.isArray(platforms) ? (
            <FlatList
              data={platforms}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.provider_id.toString()}
              renderItem={({ item }) => {
                const selected = selectedPlatforms.includes(item.provider_id);
                return (
                  <View className="items-center mr-4">
                    <Text className="text-xs text-white text-center mb-1" numberOfLines={2}>{item.provider_name}</Text>
                    <View style={{ borderWidth: selected ? 2 : 0, borderColor: selected ? '#FFD700' : 'transparent', borderRadius: 999 }}>
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w92${item.logo_path}` }}
                        className="w-12 h-12 rounded-full mb-1"
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      onPress={() => togglePlatform(item.provider_id)}
                      style={{ color: selected ? '#FFD700' : '#A8B5DB', fontWeight: 'bold', fontSize: 12, marginTop: 2 }}
                    >{selected ? 'Added' : 'Add'}</Text>
                  </View>
                );
              }}
              contentContainerStyle={{ alignItems: 'center' }}
            />
          ) : null}
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