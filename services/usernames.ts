import { Databases, Query } from 'react-native-appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export async function checkUsernameExists(database: Databases, username: string): Promise<boolean> {
  try {
    const res = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('username', username)
    ]);
    return res.documents.length > 0;
  } catch (err) {
    console.error('Appwrite username check error:', err);
    return false;
  }
}

export async function saveUsername(database: Databases, username: string): Promise<boolean> {
  try {
    await database.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      username, // Use username as document ID for uniqueness
      { username }
    );
    return true;
  } catch (err) {
    console.error('Appwrite save username error:', err);
    return false;
  }
}
