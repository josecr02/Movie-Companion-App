
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import './globals.css';
import { SavedMoviesProvider } from "@/components/SavedMoviesContext";
import { UserPlatformsProvider } from "@/components/UserPlatformsContext";
import { SharedWatchlistsProvider } from "@/components/SharedWatchlistsContext";

export default function RootLayout() {
  return (
    <SavedMoviesProvider>
      <UserPlatformsProvider>
        <SharedWatchlistsProvider>
          <StatusBar hidden={true}/>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="movies/[id]"
              options={{ headerShown: false}}
            />
          </Stack>
        </SharedWatchlistsProvider>
      </UserPlatformsProvider>
    </SavedMoviesProvider>
  )
}
