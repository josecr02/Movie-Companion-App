import MovieCard from '@/components/MovieCard'
import { useSavedMovies } from '@/components/SavedMoviesContext'
import { useUserPlatforms } from '@/components/UserPlatformsContext'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchAllMovieProviders } from '@/services/api'
import { database } from '@/services/appwrite'
import { getLocalUsername, saveLocalUsername } from '@/services/localUser'
import useFetch from '@/services/useFetch'
import { checkUsernameExists as checkUsernameExistsRaw, saveUsername } from '@/services/usernames'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

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

  // Username state and logic
  const [username, setUsername] = useState('');
  const [usernameFeedback, setUsernameFeedback] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const local = await getLocalUsername();
      setCurrentUsername(local);
    })();
  }, []);

  const handleSaveUsername = async () => {
    setUsernameFeedback('');
    if (!username.trim()) {
      setUsernameFeedback('Please enter a username.');
      return;
    }
    setUsernameLoading(true);
    try {
      const exists = await checkUsernameExistsRaw(database, username.trim());
      if (exists) {
        setUsernameFeedback('Username already taken.');
        setUsernameLoading(false);
        return;
      }
      const saved = await saveUsername(database, username.trim());
      if (saved) {
        setUsernameFeedback('Username saved!');
        setUsername('');
        await saveLocalUsername(username.trim());
        setCurrentUsername(username.trim());
      } else {
        setUsernameFeedback('Error saving username.');
      }
    } catch (err) {
      setUsernameFeedback('Error saving username.');
    } finally {
      setUsernameLoading(false);
    }
  };

  return (
    <View className="bg-primary flex-1">
      <Image source={images.bg} className="absolute w-full z-0"/>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}>
        <Image source={icons.person} className="size-20 mt-20 mb-5 mx-auto" tintColor="#fff" />
        <View className="items-center mb-8">
          <Text className="text-white text-2xl font-bold mb-1">Jose Cabello</Text>
        </View>

        {/* Username set UI */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {currentUsername && (
            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
              Your username: <Text style={{ color: 'white' }}>{currentUsername}</Text>
            </Text>
          )}
          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Set your username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#888"
            style={{ backgroundColor: '#222', color: 'white', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, width: 200, marginBottom: 8, borderWidth: 1, borderColor: '#FFD700' }}
            autoCapitalize="none"
          />
          {usernameFeedback ? <Text style={{ color: usernameFeedback.includes('saved') ? 'green' : 'red', marginBottom: 8 }}>{usernameFeedback}</Text> : null}
          <TouchableOpacity
            onPress={handleSaveUsername}
            style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 24, marginTop: 6, opacity: usernameLoading ? 0.6 : 1 }}
            disabled={usernameLoading}
          >
            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>{usernameLoading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
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
          data={favoriteMovies}
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