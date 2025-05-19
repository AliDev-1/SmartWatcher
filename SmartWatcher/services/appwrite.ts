import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (originalQuery: string, movie: any) => {
  console.log("📊 updateSearchCount called with:", {
    originalQuery,
    movieId: movie.id,
    title: movie.title || movie.name,
  });

  const movieId = movie.id.toString();
  const movieTitle = movie.title || movie.name || "Unknown";
  const posterPath = movie.poster_path;

  try {
    console.log("🔍 Checking if movie exists in database:", movieId);
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("movie_id", movieId),
    ]);
    console.log(
      "📋 Search results:",
      result.documents.length > 0 ? "exists" : "not found"
    );

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      console.log(
        "✏️ Updating existing document:",
        existingMovie.$id,
        "count:",
        existingMovie.count
      );
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
          lastSearched: new Date().toISOString(),
          lastSearchQuery: originalQuery,
        }
      );
      console.log("✅ Document updated");
    } else {
      console.log("➕ Creating new document for movie:", movieTitle);

      const doc = await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          movie_id: movieId,
          title: movieTitle,
          count: 1,
          poster_url: posterPath
            ? `https://image.tmdb.org/t/p/w500${posterPath}`
            : null,
          firstSearched: new Date().toISOString(),
          lastSearched: new Date().toISOString(),
          lastSearchQuery: originalQuery,
        }
      );
      console.log("✅ Document created:", doc.$id);
    }
  } catch (error) {
    console.error("❌ Error updating search count:", error);
    throw error;
  }
};

// Get top 5 trending searched movies from Appwrite by count
export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
};
