import { Client, Databases, ID, Query } from "react-native-appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

// Initialize Database
const database = new Databases(client);

// Constants
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const WATCHLIST_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_WATCHLISTS_COLLECTION_ID!;

export interface WatchlistItem {
  $id?: string;
  userId: string;
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterUrl?: string;
  addedAt: string;
}

// Add a media item to watchlist
export const addToWatchlist = async (item: Omit<WatchlistItem, "addedAt">) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", item.userId),
        Query.equal("mediaId", item.mediaId),
        Query.equal("mediaType", item.mediaType),
      ]
    );

    // If the item already exists, return it
    if (result.documents.length > 0) {
      return result.documents[0];
    }

    // Otherwise create a new document
    const newItem = await database.createDocument(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      ID.unique(),
      {
        userId: item.userId,
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        title: item.title,
        posterUrl: item.posterUrl || null,
        addedAt: new Date().toISOString(),
      }
    );

    return newItem;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (
  userId: string,
  mediaId: string,
  mediaType: "movie" | "tv"
) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("mediaId", mediaId),
        Query.equal("mediaType", mediaType),
      ]
    );

    if (result.documents.length > 0) {
      await database.deleteDocument(
        DATABASE_ID,
        WATCHLIST_COLLECTION_ID,
        result.documents[0].$id
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
};

// Check if media is in watchlist
export const isInWatchlist = async (
  userId: string,
  mediaId: string,
  mediaType: "movie" | "tv"
) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("mediaId", mediaId),
        Query.equal("mediaType", mediaType),
      ]
    );
    return result.documents.length > 0;
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return false;
  }
};

// Get user's watchlist
export const getUserWatchlist = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("addedAt")]
    );
    return result.documents as WatchlistItem[];
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
};

// Get user's movie watchlist
export const getUserMovieWatchlist = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("mediaType", "movie"),
        Query.orderDesc("addedAt"),
      ]
    );
    return result.documents as WatchlistItem[];
  } catch (error) {
    console.error("Error fetching movie watchlist:", error);
    return [];
  }
};

// Get user's TV watchlist
export const getUserTVWatchlist = async (userId: string) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      WATCHLIST_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.equal("mediaType", "tv"),
        Query.orderDesc("addedAt"),
      ]
    );
    return result.documents as WatchlistItem[];
  } catch (error) {
    console.error("Error fetching TV watchlist:", error);
    return [];
  }
};
