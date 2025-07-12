import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SwipeMovieCard({ poster_path, title, overview }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${poster_path}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.overview} numberOfLines={4}>{overview}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: width * 1.3,
    backgroundColor: '#222',
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '70%',
  },
  info: {
    padding: 16,
    width: '100%',
  },
  title: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
  },
  overview: {
    color: '#fff',
    fontSize: 15,
  },
});
