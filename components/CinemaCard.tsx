import { icons } from '@/constants/icons';
import { Movie } from '@/interfaces/interfaces';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const CinemaCard = (movie: Movie) => {
  const { id, poster_path, title, release_date } = movie;
  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity style={{ width: 320, marginRight: 24 }}>
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w780${poster_path}`
              : `https://placehold.co/600x900/1a1a1a/ffffff.png`
          }}
          style={{ width: 320, height: 480, borderRadius: 20 }}
          resizeMode="cover"
        />
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 22, marginTop: 12 }} numberOfLines={2}>{title}</Text>
        <Text style={{ color: '#FFD700', fontSize: 16, marginTop: 4 }}>{release_date}</Text>
      </TouchableOpacity>
    </Link>
  );
};

export default CinemaCard;
