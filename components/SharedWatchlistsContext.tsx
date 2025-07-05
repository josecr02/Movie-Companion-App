import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { database } from '@/services/appwrite';
import { getLocalUsername } from '@/services/localUser';
import * as watchlistsApi from '@/services/watchlists';

export interface Watchlist {
  id: string;
  name: string;
  movies_ids: string[];
  members: string[];
}

interface SharedWatchlistsContextType {
  watchlists: Watchlist[];
  addMovieToWatchlist: (watchlistId: string, movieId: string) => Promise<void>;
  inviteToWatchlist: (watchlistId: string, username: string) => Promise<void>;
  createWatchlist: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const SharedWatchlistsContext = createContext<SharedWatchlistsContextType | undefined>(undefined);

export const SharedWatchlistsProvider = ({ children }: { children: React.ReactNode }) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Load current username
  useEffect(() => {
    (async () => {
      const username = await getLocalUsername();
      setCurrentUser(username);
    })();
  }, []);

  // Fetch watchlists from Appwrite
  const fetchWatchlists = useCallback(async () => {
    if (!currentUser) return;
    const docs = await watchlistsApi.fetchWatchlists(database, currentUser);
    setWatchlists(docs.map(doc => ({
      id: doc.$id,
      name: doc.name,
      movies_ids: doc.movies_ids,
      members: doc.members,
    })));
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchWatchlists();
  }, [currentUser, fetchWatchlists]);

  // Add a movie to a watchlist
  const addMovieToWatchlist = async (watchlistId: string, movieId: string) => {
    await watchlistsApi.addMovieToWatchlist(database, watchlistId, movieId);
    await fetchWatchlists();
  };

  // Invite a user to a watchlist
  const inviteToWatchlist = async (watchlistId: string, username: string) => {
    await watchlistsApi.addMemberToWatchlist(database, watchlistId, username);
    await fetchWatchlists();
  };

  // Create a new watchlist
  const createWatchlist = async (name: string) => {
    if (!currentUser) return;
    try {
      await watchlistsApi.createWatchlist(database, name, currentUser);
      await fetchWatchlists();
    } catch (err) {
      console.error('Create watchlist error:', err);
      throw err;
    }
  };

  // Manual refresh
  const refresh = async () => {
    await fetchWatchlists();
  };

  return (
    <SharedWatchlistsContext.Provider value={{ watchlists, addMovieToWatchlist, inviteToWatchlist, createWatchlist, refresh }}>
      {children}
    </SharedWatchlistsContext.Provider>
  );
};

export const useSharedWatchlists = () => {
  const ctx = useContext(SharedWatchlistsContext);
  if (!ctx) throw new Error('useSharedWatchlists must be used within SharedWatchlistsProvider');
  return ctx;
};
