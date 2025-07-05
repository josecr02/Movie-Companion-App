import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';

interface Watchlist {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  watchlists: Watchlist[];
  onSelect: (id: string) => void;
  onCancel: () => void;
}

const SelectWatchlistModal: React.FC<Props> = ({ visible, watchlists, onSelect, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#181A2A', borderRadius: 18, padding: 18, minWidth: 260, maxWidth: 300 }}>
          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 19, marginBottom: 12, textAlign: 'center' }}>
            Add to Watchlist
          </Text>
          <FlatList
            data={watchlists}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item.id)}
                style={{ paddingVertical: 10, borderBottomWidth: 0.5, borderColor: '#333' }}
              >
                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={{ marginBottom: 6, maxHeight: 180 }}
          />
          <TouchableOpacity onPress={onCancel} style={{ marginTop: 8, alignSelf: 'center' }}>
            <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 15 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SelectWatchlistModal;
