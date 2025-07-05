import MovieCard from '@/components/MovieCard';
import { images } from '@/constants/images';
import React, { useState } from 'react';
import { FlatList, Image, Text, View, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

// Dummy data for demonstration

import { useSharedWatchlists } from '@/components/SharedWatchlistsContext';
import { checkUsernameExists } from '@/services/appwrite';

const Shared = () => {
  const { watchlists, inviteToWatchlist } = useSharedWatchlists();
  const [selected, setSelected] = useState(watchlists[0]?.id || null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const currentList = watchlists.find(w => w.id === selected);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
      <View className="px-5 pt-10">
        <Text className="text-white text-2xl font-bold mb-4">Shared Watchlists</Text>
        <FlatList
          data={watchlists}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelected(item.id)}
              style={{
                backgroundColor: selected === item.id ? '#FFD700' : '#222',
                borderRadius: 16,
                paddingVertical: 8,
                paddingHorizontal: 18,
                marginRight: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: selected === item.id ? '#222' : '#FFD700', fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={{ marginBottom: 10 }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 8 }}>
          <Text className="text-white text-lg font-bold mr-3">{currentList?.name || 'No Watchlist Selected'}</Text>
          {currentList && (
            <TouchableOpacity
              onPress={() => { setInviteModalVisible(true); setInviteUsername(''); setInviteError(''); }}
              style={{ backgroundColor: '#FFD700', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12 }}
            >
              <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 14 }}>Invite</Text>
            </TouchableOpacity>
          )}
        </View>
        {currentList && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {currentList.members?.map((member) => (
              <View key={member} style={{ backgroundColor: '#222', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 4 }}>
                <Text style={{ color: '#FFD700', fontSize: 13 }}>{member}</Text>
              </View>
            ))}
          </View>
        )}
        <FlatList
          data={currentList?.movies || []}
          renderItem={({ item }) => <MovieCard {...item} />}
          keyExtractor={item => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: 'flex-start', gap: 20, paddingRight: 5, marginBottom: 10 }}
          className="mt-2"
          ListEmptyComponent={<Text className="text-gray-400 mt-10">No movies in this watchlist yet.</Text>}
        />
        {/* Invite Modal */}
        <Modal
          visible={inviteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' }}
          >
            <View style={{ backgroundColor: '#181A2A', borderRadius: 18, padding: 22, minWidth: 260, maxWidth: 320, alignItems: 'center' }}>
              <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Invite to Watchlist</Text>
              <TextInput
                value={inviteUsername}
                onChangeText={setInviteUsername}
                placeholder="Enter username"
                placeholderTextColor="#888"
                style={{ backgroundColor: '#222', color: 'white', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, width: 200, marginBottom: 8, borderWidth: 1, borderColor: '#FFD700' }}
                autoFocus
              />
              {inviteError ? <Text style={{ color: 'red', marginBottom: 6 }}>{inviteError}</Text> : null}
              {inviteSuccess ? <Text style={{ color: 'green', marginBottom: 6 }}>{inviteSuccess}</Text> : null}
              <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
                <TouchableOpacity
                  disabled={inviteLoading}
                  onPress={async () => {
                    setInviteError('');
                    setInviteSuccess('');
                    if (!inviteUsername.trim()) {
                      setInviteError('Please enter a username.');
                      return;
                    }
                    if (!currentList || !Array.isArray(currentList.members)) {
                      setInviteError('Watchlist is not ready.');
                      return;
                    }
                    if (currentList.members.includes(inviteUsername.trim())) {
                      setInviteError('User already invited.');
                      return;
                    }
                    setInviteLoading(true);
                    try {
                      const exists = await checkUsernameExists(inviteUsername.trim());
                      if (!exists) {
                        setInviteError('User does not exist.');
                        setInviteLoading(false);
                        return;
                      }
                      inviteToWatchlist(currentList.id, inviteUsername.trim());
                      setInviteSuccess('Invitation sent!');
                      setInviteUsername('');
                    } catch (err) {
                      setInviteError('Error checking username.');
                    } finally {
                      setInviteLoading(false);
                    }
                  }}
                  style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 18, marginRight: 10, opacity: inviteLoading ? 0.7 : 1 }}
                >
                  {inviteLoading ? (
                    <ActivityIndicator color="#222" size="small" />
                  ) : (
                    <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}>Invite</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={inviteLoading}
                  onPress={() => { setInviteModalVisible(false); setInviteError(''); setInviteSuccess(''); setInviteUsername(''); }}
                  style={{ backgroundColor: '#222', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 18, borderWidth: 1, borderColor: '#FFD700' }}
                >
                  <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 15 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </View>
  );
};

export default Shared;
