import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  console.log("updateSearchCount called with:", { query, movie });

  try {
    console.log("Checking if search term exists:", query);
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);
    console.log(
      "Search results:",
      result.documents.length > 0 ? "exists" : "not found"
    );

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      console.log(
        "Updating existing document:",
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
        }
      );
      console.log("Document updated");
    } else {
      console.log("Creating new document with data:", {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });

      const doc = await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movie.id,
          title: movie.title,
          count: 1,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
      console.log("Document created:", doc.$id);
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

// Get top 5 trending searched movies from Appwrite by count
export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return [];
  }
};
