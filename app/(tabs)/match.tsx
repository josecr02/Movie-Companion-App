import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSharedWatchlists } from '@/components/SharedWatchlistsContext';
import { database } from '@/services/appwrite';
import { getLocalUsername } from '@/services/localUser';
import * as matchesApi from '@/services/matches';
import { fetchMoviesByIds } from '@/services/tmdb';
import { fetchRandomPopularMovieIds } from '@/services/randomMovies';
import { fetchGenresForMovies, discoverMovieByGenres } from '@/services/smartMatch';
import MovieCard from '@/components/MovieCard';

const NUM_MOVIES = 12;


const MatchTab = () => {
  const [step, setStep] = useState<'idle'|'inviting'|'waiting'|'accept'|'matching'|'result'>('idle');
  const [invitee, setInvitee] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [matchId, setMatchId] = useState<string|null>(null);
  const [match, setMatch] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<string|null>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [answeringIndex, setAnsweringIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultMovie, setResultMovie] = useState<any>(null);

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
      if (m.status === 'accept' && step === 'idle') setStep('accept');
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

  // When match is active, load movies for this user
  useEffect(() => {
    if (!match || !currentUser) return;
    let ids: string[] = [];
    if (currentUser === match.initiator) ids = match.initiator_movies;
    else ids = match.invitee_movies;
    if (ids.length) {
      fetchMoviesByIds(ids).then(setMovies);
    }
  }, [match, currentUser]);



  // Invite user to match
  const handleInvite = async () => {
    setInviteError('');
    if (!invitee.trim() || !currentUser) {
      setInviteError('Enter a username.');
      return;
    }
    setLoading(true);
    try {
      // Fetch 12 random movie IDs from TMDb
      const initiatorIds = await fetchRandomPopularMovieIds(NUM_MOVIES);
      const matchDoc = await matchesApi.createMatch(database, currentUser, invitee.trim(), initiatorIds);
      setMatchId(matchDoc.$id);
      setMatch(matchDoc);
      setStep('waiting');
    } catch (err) {
      setInviteError('Could not start match.');
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
      const inviteeIds = await fetchRandomPopularMovieIds(NUM_MOVIES);
      await matchesApi.acceptMatch(database, match.$id, inviteeIds);
      setStep('matching');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer for current movie
  const handleAnswer = async (answer: string) => {
    if (!match || !currentUser) return;
    setLoading(true);
    try {
      await matchesApi.submitAnswer(database, match.$id, currentUser, answer);
      setAnswers([...answers, answer]);
      setAnsweringIndex(answeringIndex + 1);
      // If last movie, wait for both users to finish
      if (answeringIndex + 1 === NUM_MOVIES) {
        // Poll for both users' answers
        let done = false;
        let resultMovieId = null;
        while (!done) {
          const updatedMatch = await matchesApi.getMatch(database, match.$id);
          const initiatorDone = updatedMatch.initiator_answers.length === NUM_MOVIES;
          const inviteeDone = updatedMatch.invitee_answers.length === NUM_MOVIES;
          // Only proceed if both finished
          if (initiatorDone && inviteeDone) {
            // Smart match: find a new movie by genre profile
            const initiatorLikes = updatedMatch.initiator_answers.map((a, i) => (a === 'love' || a === 'like') ? updatedMatch.initiator_movies[i] : null).filter(Boolean) as string[];
            const inviteeLikes = updatedMatch.invitee_answers.map((a, i) => (a === 'love' || a === 'like') ? updatedMatch.invitee_movies[i] : null).filter(Boolean) as string[];
            const allLiked = Array.from(new Set([...initiatorLikes, ...inviteeLikes]));
            // Get top genres from liked movies
            let genres: number[] = [];
            if (allLiked.length > 0) {
              genres = await fetchGenresForMovies(allLiked);
            }
            // Exclude all movies shown in this session
            const excludeIds = Array.from(new Set([
              ...updatedMatch.initiator_movies,
              ...updatedMatch.invitee_movies
            ]));
            // Discover a new movie by genres
            let smartMatch: any = null;
            if (genres.length > 0) {
              smartMatch = await discoverMovieByGenres(genres, excludeIds);
            }
            // Fallback: pick any liked movie, or any shown movie
            resultMovieId = smartMatch?.id?.toString() || initiatorLikes[0] || inviteeLikes[0] || updatedMatch.initiator_movies[0];
            await matchesApi.finishMatch(database, match.$id, resultMovieId);
            done = true;
            // Set result movie
            if (smartMatch) {
              setResultMovie(smartMatch);
            } else {
              const movieObj = movies.find(m => m.id.toString() === resultMovieId) || movies[0];
              setResultMovie(movieObj);
            }
            setStep('result');
          } else {
            // Wait and poll again
            await new Promise(res => setTimeout(res, 1500));
          }
        }
      }
    } finally {
      setLoading(false);
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
  if (step === 'matching' && movies.length > 0) {
    const movie = movies[answeringIndex];
    // If finished, show waiting screen
    if (answeringIndex >= NUM_MOVIES) {
      return (
        <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Waiting for your match...</Text>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#181A2A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 20, marginBottom: 10 }}>Movie {answeringIndex + 1} of {NUM_MOVIES}</Text>
        <MovieCard {...movie} />
        <View style={{ flexDirection: 'row', marginTop: 18, gap: 10 }}>
          <TouchableOpacity onPress={() => handleAnswer('love')} style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18, marginRight: 6 }}>
            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>I Love</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleAnswer('like')} style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18, marginRight: 6 }}>
            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>I Like</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleAnswer('dislike')} style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18, marginRight: 6 }}>
            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>I Don't Like</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleAnswer('not_watched')} style={{ backgroundColor: '#FFD700', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 18 }}>
            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>Not Watched</Text>
          </TouchableOpacity>
        </View>
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
            setAnsweringIndex(0);
            setAnswers([]);
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
