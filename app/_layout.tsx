
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import './globals.css';
import { SavedMoviesProvider } from "@/components/SavedMoviesContext";
import { UserPlatformsProvider } from "@/components/UserPlatformsContext";

export default function RootLayout() {
  return (
    <SavedMoviesProvider>
      <UserPlatformsProvider>
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
      </UserPlatformsProvider>
    </SavedMoviesProvider>
  )
}
