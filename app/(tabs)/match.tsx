import MovieCard from '@/components/MovieCard';
import SwipeMovieCard from '@/components/SwipeMovieCard';
import { database } from '@/services/appwrite';
import * as infiniteMatchApi from '@/services/infiniteMatch';
import { getLocalUsername } from '@/services/localUser';
import * as matchesApi from '@/services/matches';
import { fetchRandomPopularMovieIds } from '@/services/randomMovies';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';


// Infinite mode: number of movies to buffer in the deck at a time
const MOVIE_DECK_SIZE = 5;


const MatchTab = () => {
  const [step, setStep] = useState<'idle'|'inviting'|'waiting'|'accept'|'matching'|'result'>('idle');
  const [invitee, setInvitee] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [matchId, setMatchId] = useState<string|null>(null);
  const [match, setMatch] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<string|null>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Infinite swipe state
  const [deckMovies, setDeckMovies] = useState<any[]>([]); // Movies in the current deck
  const [deckIndex, setDeckIndex] = useState(0); // Index in the infinite list
  const [swiping, setSwiping] = useState(false);
  const [resultMovie, setResultMovie] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string|null>(null); // Infinite match session id
  const [otherUser, setOtherUser] = useState<string|null>(null);
  const [matchFound, setMatchFound] = useState(false);

  // Load username
  useEffect(() => {
    getLocalUsername().then(setCurrentUser);
  }, []);

  // Poll for match updates if in waiting/accept/matching
  useEffect(() => {
    if (!matchId) return;
    const interval = setInterval(async () => {
      const m = await matchesApi.getMatch(database, matchId);
      setMatch(m);
      if (m.status === 'active' && step === 'waiting') setStep('matching');
      // Accept step is handled by invite polling below
      if (m.status === 'finished' && step !== 'result') setStep('result');
    }, 2000);
    return () => clearInterval(interval);
  }, [matchId, step]);

  // Poll for incoming invites when idle
  useEffect(() => {
    if (!currentUser || matchId || step !== 'idle') return;
    const interval = setInterval(async () => {
      const matches = await matchesApi.getUserMatches(database, currentUser);
      // Find a match where this user is the invitee and status is 'pending'
      const pendingInvite = matches.find(m => m.invitee === currentUser && m.status === 'pending');
      if (pendingInvite) {
        setMatchId(pendingInvite.$id);
        setMatch(pendingInvite);
        setStep('accept');
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser, matchId, step]);


  // When match is active, start infinite matchmaking session
  useEffect(() => {
    if (!match || !currentUser || step !== 'matching') return;
    // Only start session if not already started
    if (sessionId) return;
    // Determine other user
    const other = currentUser === match.initiator ? match.invitee : match.initiator;
    setOtherUser(other);
    // Start or join infinite match session (id = match.$id)
    (async () => {
      setLoading(true);
      try {
        // Create or join session in Appwrite
        await infiniteMatchApi.initSession(match.$id, [currentUser, other], match.initiator, match.invitee);
        setSessionId(match.$id);
        // Fetch initial deck
        const movies = await infiniteMatchApi.getMoviesForSession(match.$id, 0, MOVIE_DECK_SIZE);
        console.log('[DEBUG] getMoviesForSession returned:', movies);
        setDeckMovies(movies);
        setDeckIndex(0);
      } catch (e) {
        console.log('[DEBUG] Error in matchmaking session:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [match, currentUser, step]);

  // Poll for match found (both swiped right on same movie)
  useEffect(() => {
    if (!sessionId || !currentUser || !otherUser || matchFound || step !== 'matching') return;
    const interval = setInterval(async () => {
      const matchResult = await infiniteMatchApi.checkForMatch(sessionId);
      if (matchResult && matchResult.movie) {
        setResultMovie(matchResult.movie);
        setMatchFound(true);
        setStep('result');
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [sessionId, currentUser, otherUser, matchFound, step]);



  // Invite user to match
  const handleInvite = async () => {
    setInviteError('');
    if (!invitee.trim() || !currentUser) {
      setInviteError('Enter a username.');
      return;
    }
    setLoading(true);
    try {
      // Create match with empty swipes arrays for infinite mode
      const matchDoc = await matchesApi.createMatch(database, currentUser, invitee.trim(), []);
      // Patch: ensure initiator_swipes and invitee_swipes are set for new match
      await infiniteMatchApi.initSession(matchDoc.$id, [currentUser, invitee.trim()], currentUser, invitee.trim());
      setMatchId(matchDoc.$id);
      setMatch(matchDoc);
      setStep('waiting');
    } catch (err) {
      setInviteError('Could not start match.');
      console.log('[DEBUG] Error in handleInvite:', err);
    } finally {
      setLoading(false);
    }
  };

  // Accept match (invitee)
  const handleAccept = async () => {
    if (!match || !currentUser) return;
    setLoading(true);
    try {
      // Fetch 12 random movie IDs from TMDb for invitee
      const inviteeIds = await fetchRandomPopularMovieIds(12);
      await matchesApi.acceptMatch(database, match.$id, inviteeIds);
      setStep('matching');
    } finally {
      setLoading(false);
    }
  };


  // Handle swipe (right = want to watch, left = not interested)
  const handleSwipe = async (cardIndex: number, direction: 'right' | 'left') => {
    if (!sessionId || !currentUser || !deckMovies[cardIndex] || !match) return;
    setSwiping(true);
    try {
      const movie = deckMovies[cardIndex];
      await infiniteMatchApi.submitSwipe(
        database,
        sessionId,
        currentUser,
        movie.id,
        direction,
        match.initiator,
        match.invitee
      );
      // If deck is running low, fetch more
      if (cardIndex + 1 >= deckMovies.length - 2) {
        const nextIndex = deckIndex + deckMovies.length;
        const moreMovies = await infiniteMatchApi.getMoviesForSession(sessionId, nextIndex, MOVIE_DECK_SIZE);
        setDeckMovies(prev => [...prev, ...moreMovies]);
      }
      setDeckIndex(deckIndex + 1);
    } finally {
      setSwiping(false);
    }
  };

  // UI
  if (step === 'idle') {
    return (
      <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 22, marginBottom: 18 }}>Start a Movie Match!</Text>
        <TextInput
          value={invitee}
          onChangeText={setInvitee}
          placeholder="Enter username to invite"
          placeholderTextColor="#888"
          style={{ backgroundColor: '#222', color: 'white', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, width: 220, marginBottom: 8, borderWidth: 1, borderColor: '#FFD700' }}
        />
        {inviteError ? <Text style={{ color: 'red', marginBottom: 8 }}>{inviteError}</Text> : null}
        <TouchableOpacity onPress={handleInvite} style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 32, marginTop: 6 }}>
          <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>Invite</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (step === 'waiting') {
    return (
      <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>Waiting for {invitee} to accept...</Text>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }
  if (step === 'accept') {
    return (
      <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>{match?.initiator} invited you to a Movie Match!</Text>
        <TouchableOpacity onPress={handleAccept} style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 32, marginTop: 6 }}>
          <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>Accept</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (step === 'matching') {
    if (loading) {
      return (
        <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 18, marginTop: 18 }}>Loading movies...</Text>
        </View>
      );
    }
    if (!deckMovies || deckMovies.length === 0) {
      return (
        <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>No movies found. Please try again later.</Text>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Swipe to Match!</Text>
        <Swiper
          cards={deckMovies}
          cardIndex={deckIndex}
          renderCard={movie => <SwipeMovieCard {...movie} />}
          onSwipedRight={i => handleSwipe(i, 'right')}
          onSwipedLeft={i => handleSwipe(i, 'left')}
          stackSize={3}
          backgroundColor="transparent"
          disableTopSwipe
          disableBottomSwipe
          animateCardOpacity
          cardVerticalMargin={30}
          overlayLabels={{
            left: {
              title: 'Nope',
              style: {
                label: { backgroundColor: '#FFD700', color: '#222', fontSize: 24, borderRadius: 8, padding: 8 },
                wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 }
              }
            },
            right: {
              title: 'Want to Watch',
              style: {
                label: { backgroundColor: '#FFD700', color: '#222', fontSize: 24, borderRadius: 8, padding: 8 },
                wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 }
              }
            }
          }}
          disableLeftSwipe={swiping}
          disableRightSwipe={swiping}
        />
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginTop: 18 }}>Swipe right if you want to watch, left to skip. When you both swipe right on the same movie, you'll match!</Text>
        {loading && <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />}
      </View>
    );
  }
  if (step === 'result' && resultMovie) {
    return (
      <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 22, marginBottom: 18 }}>Your Movie Match!</Text>
        <MovieCard {...resultMovie} />
        <Text style={{ color: 'white', fontSize: 18, marginTop: 18 }}>Enjoy your movie night!</Text>
        <TouchableOpacity
          style={{ marginTop: 30, backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32 }}
          onPress={() => {
            // Reset all state to start a new match
            setStep('idle');
            setInvitee('');
            setInviteError('');
            setMatchId(null);
            setMatch(null);
            setMovies([]);
            setLoading(false);
            setDeckIndex(0);
            setDeckMovies([]);
            setSessionId(null);
            setOtherUser(null);
            setMatchFound(false);
            setResultMovie(null);
          }}
        >
          <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 18 }}>Start Another Match</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return <View style={{ flex: 1, backgroundColor: '#181A2A' }} />;
};

export default MatchTab;
