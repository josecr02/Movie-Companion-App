import { Movie } from '@/interfaces/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SavedMoviesContextType {
  savedMovies: Movie[];
  saveMovie: (movie: Movie) => void;
  unsaveMovie: (movieId: string) => void;
  isMovieSaved: (movieId: string) => boolean;
  favoriteMovies: Movie[];
  favoriteMovie: (movie: Movie) => void;
  unfavoriteMovie: (movieId: string) => void;
  isMovieFavorited: (movieId: string) => boolean;
}

const SavedMoviesContext = createContext<SavedMoviesContextType | undefined>(undefined);

export const SavedMoviesProvider = ({ children }: { children: ReactNode }) => {
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);

  // Load saved and favorite movies from AsyncStorage on mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const savedJson = await AsyncStorage.getItem('savedMovies');
        if (savedJson) setSavedMovies(JSON.parse(savedJson));
        const favJson = await AsyncStorage.getItem('favoriteMovies');
        if (favJson) setFavoriteMovies(JSON.parse(favJson));
      } catch (e) {
        // handle error if needed
      }
    };
    loadMovies();
  }, []);

  // Save to AsyncStorage whenever savedMovies or favoriteMovies changes
  useEffect(() => {
    AsyncStorage.setItem('savedMovies', JSON.stringify(savedMovies));
  }, [savedMovies]);
  useEffect(() => {
    AsyncStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
  }, [favoriteMovies]);
  // Favorite logic
  const favoriteMovie = (movie: Movie) => {
    setFavoriteMovies((prev) => (prev.find((m) => m.id === movie.id) ? prev : [...prev, movie]));
  };

  const unfavoriteMovie = (movieId: string) => {
    setFavoriteMovies((prev) => prev.filter((m) => m.id.toString() !== movieId));
  };

  const isMovieFavorited = (movieId: string) => {
    return favoriteMovies.some((m) => m.id.toString() === movieId);
  };

  const saveMovie = (movie: Movie) => {
    setSavedMovies((prev) => (prev.find((m) => m.id === movie.id) ? prev : [...prev, movie]));
  };

  const unsaveMovie = (movieId: string) => {
    setSavedMovies((prev) => prev.filter((m) => m.id.toString() !== movieId));
  };

  const isMovieSaved = (movieId: string) => {
    return savedMovies.some((m) => m.id.toString() === movieId);
  };

  return (
    <SavedMoviesContext.Provider value={{
      savedMovies, saveMovie, unsaveMovie, isMovieSaved,
      favoriteMovies, favoriteMovie, unfavoriteMovie, isMovieFavorited
    }}>
      {children}
    </SavedMoviesContext.Provider>
  );
};

export const useSavedMovies = () => {
  const context = useContext(SavedMoviesContext);
  if (!context) {
    throw new Error('useSavedMovies must be used within a SavedMoviesProvider');
  }
  return context;
};
