import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '@/interfaces/interfaces';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedMoviesContextType {
  savedMovies: Movie[];
  saveMovie: (movie: Movie) => void;
  unsaveMovie: (movieId: string) => void;
  isMovieSaved: (movieId: string) => boolean;
}

const SavedMoviesContext = createContext<SavedMoviesContextType | undefined>(undefined);

export const SavedMoviesProvider = ({ children }: { children: ReactNode }) => {
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);

  // Load saved movies from AsyncStorage on mount
  useEffect(() => {
    const loadSavedMovies = async () => {
      try {
        const json = await AsyncStorage.getItem('savedMovies');
        if (json) {
          setSavedMovies(JSON.parse(json));
        }
      } catch (e) {
        // handle error if needed
      }
    };
    loadSavedMovies();
  }, []);

  // Save to AsyncStorage whenever savedMovies changes
  useEffect(() => {
    AsyncStorage.setItem('savedMovies', JSON.stringify(savedMovies));
  }, [savedMovies]);

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
    <SavedMoviesContext.Provider value={{ savedMovies, saveMovie, unsaveMovie, isMovieSaved }}>
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
