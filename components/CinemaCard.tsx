
import { icons } from '@/constants/icons';
import { Movie } from '@/interfaces/interfaces';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet, Platform } from 'react-native';


function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const CinemaCard = (movie: Movie) => {
  const { id, poster_path, title, release_date } = movie;
  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity style={styles.cardContainer}>
        <View style={styles.posterShadowWrap}>
          <Image
            source={{
              uri: poster_path
                ? `https://image.tmdb.org/t/p/w780${poster_path}`
                : `https://placehold.co/600x900/1a1a1a/ffffff.png`
            }}
            style={styles.poster}
            resizeMode="cover"
          />
          <View style={styles.posterGlow} pointerEvents="none" />
        </View>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.date}>{formatDate(release_date)}</Text>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 300,
    marginRight: 24,
    alignItems: 'center',
  },
  posterShadowWrap: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 28,
    backgroundColor: '#222',
    marginBottom: 0,
    marginHorizontal: 8, // Add horizontal margin to separate glows
    ...Platform.select({
      android: {
        elevation: 12,
      },
    }),
  },
  poster: {
    width: 300,
    height: 450,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  posterGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: 450,
    borderRadius: 24,
    backgroundColor: 'rgba(255,215,0,0.04)', // Less intense glow
    zIndex: 2,
    pointerEvents: 'none',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 26,
    marginTop: 18,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  date: {
    color: '#FFD700',
    fontSize: 18,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default CinemaCard;
