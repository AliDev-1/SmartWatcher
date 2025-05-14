import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";

import SearchBar from "@/components/SearchBar";
import MovieDisplayCard from "@/components/MovieCard";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasCompletedSearch, setHasCompletedSearch] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setHasCompletedSearch(false);
  };

  // Search function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Searching for:", query);

      const data = await fetchMovies({ query });
      console.log("Search results:", data.results?.length || 0);

      const results = data.results || [];
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err : new Error("Search failed"));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    // Clear timeout on new input
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        setHasCompletedSearch(true);
        performSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Add a separate effect for updating search count
  useEffect(() => {
    if (searchQuery.trim() && searchResults.length > 0 && hasCompletedSearch) {
      console.log("ATTEMPTING TO UPDATE SEARCH COUNT:");
      console.log("- Query:", searchQuery);
      console.log("- Movie ID:", searchResults[0].id);
      console.log("- Title:", searchResults[0].title);
      console.log("- Has poster_path:", !!searchResults[0].poster_path);

      updateSearchCount(searchQuery, searchResults[0])
        .then(() => console.log("✅ Search count updated successfully"))
        .catch((err) =>
          console.error("❌ Failed to update search count:", err)
        );
    }
  }, [searchResults, hasCompletedSearch]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                placeholder="Search for a movie"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {!loading &&
              !error &&
              searchQuery.trim() &&
              searchResults.length > 0 && (
                <Text className="text-xl text-white font-bold">
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? "No movies found"
                  : "Start typing to search for movies"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
