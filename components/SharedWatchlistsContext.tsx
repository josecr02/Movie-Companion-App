import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Watchlist {
  id: string;
  name: string;
  movies: any[];
  members: string[]; // user IDs or names
}

interface SharedWatchlistsContextType {
  watchlists: Watchlist[];
  addMovieToWatchlist: (watchlistId: string, movie: any) => void;
}


interface InviteToWatchlistFn {
  (watchlistId: string, user: string): void;
}

interface SharedWatchlistsContextType {
  watchlists: Watchlist[];
  addMovieToWatchlist: (watchlistId: string, movie: any) => void;
  inviteToWatchlist: InviteToWatchlistFn;
}

const SharedWatchlistsContext = createContext<SharedWatchlistsContextType | undefined>(undefined);

export const SharedWatchlistsProvider = ({ children }: { children: React.ReactNode }) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('sharedWatchlists');
        if (stored) {
          setWatchlists(JSON.parse(stored));
        } else {
          setWatchlists([
            { id: '1', name: 'With Chloe', movies: [], members: ['You', 'Chloe'] },
            { id: '2', name: 'Family Night', movies: [], members: ['You', 'Family'] },
          ]);
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  // Save to AsyncStorage whenever watchlists changes (after initial load)
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem('sharedWatchlists', JSON.stringify(watchlists));
    }
  }, [watchlists, loaded]);

  const addMovieToWatchlist = (watchlistId: string, movie: any) => {
    setWatchlists((prev) =>
      prev.map((w) =>
        w.id === watchlistId && !w.movies.some((m) => m.id === movie.id)
          ? { ...w, movies: [...w.movies, movie] }
          : w
      )
    );
  };

  const inviteToWatchlist: InviteToWatchlistFn = (watchlistId, user) => {
    setWatchlists((prev) =>
      prev.map((w) =>
        w.id === watchlistId && !w.members.includes(user)
          ? { ...w, members: [...w.members, user] }
          : w
      )
    );
  };

  return (
    <SharedWatchlistsContext.Provider value={{ watchlists, addMovieToWatchlist, inviteToWatchlist }}>
      {children}
    </SharedWatchlistsContext.Provider>
  );
};

export const useSharedWatchlists = () => {
  const ctx = useContext(SharedWatchlistsContext);
  if (!ctx) throw new Error('useSharedWatchlists must be used within SharedWatchlistsProvider');
  return ctx;
};
