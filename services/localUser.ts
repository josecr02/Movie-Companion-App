// Local user utility for storing and retrieving the username
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERNAME_KEY = 'local_username';

export async function saveLocalUsername(username: string) {
  await AsyncStorage.setItem(USERNAME_KEY, username);
}

export async function getLocalUsername(): Promise<string | null> {
  return AsyncStorage.getItem(USERNAME_KEY);
}
