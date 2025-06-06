import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import { generateMovieTitles } from "@/services/openai";

import SearchBar from "@/components/SearchBar";
import AnimatedBackground from "@/components/AnimatedBackground";

// Use the Movie interface from api.ts to ensure type compatibility
interface Movie {
  id: number;
  poster_path: string;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  backdrop_path: string;
  media_type?: string;
  popularity: number;
}

// Constants for animation
const { height } = Dimensions.get("screen");
const _spacing = 8;
const _borderRadius = 12;
const _itemSize = height * 0.62;
const _itemFullSize = _itemSize + _spacing * 2;

type AnimatedCardProps = {
  item: Movie;
  index: number;
  scrollY: Animated.SharedValue<number>;
};

function AnimatedCard({ item, index, scrollY }: AnimatedCardProps) {
  const stylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [index - 1, index, index + 1],
        [0.4, 1, 0.4]
      ),
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [index - 1, index, index + 1],
            [0.92, 1, 0.92],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const handlePress = () => {
    const isTV = item.media_type === "tv" || (item.name && !item.title);
    if (isTV) {
      router.push(`/tv/${item.id}`);
    } else {
      router.push(`/movie/${item.id}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View
        style={[
          {
            height: _itemSize,
            padding: _spacing * 2,
            borderRadius: _borderRadius,
            gap: _spacing * 2,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
          stylez,
        ]}
      >
        <Image
          source={{
            uri: item.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
              : "https://via.placeholder.com/500x281?text=No+Backdrop",
          }}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: _borderRadius, opacity: 0.6 },
          ]}
          blurRadius={50}
        />
        <Image
          source={{
            uri: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "https://via.placeholder.com/500x750?text=No+Poster",
          }}
          style={{
            borderRadius: _borderRadius - _spacing / 2,
            flex: 1,
            height: _itemSize * 0.4,
            objectFit: "cover",
            margin: -_spacing,
          }}
        />
        <View style={{ gap: _spacing }}>
          <Text style={{ fontSize: 24, color: "#fff", fontWeight: "700" }}>
            {item.title || item.name}
          </Text>
          <Text style={{ fontWeight: "300", color: "#ddd" }} numberOfLines={3}>
            {item.overview}
          </Text>
        </View>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: _spacing }}
        >
          <Text style={{ color: "#ddd", fontSize: 12 }}>
            Rating: {item.vote_average.toFixed(1)}/10
          </Text>
          <Text style={{ color: "#ddd", fontSize: 12 }}>
            {item.release_date || item.first_air_date}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { autoFocus } = useLocalSearchParams<{ autoFocus: string }>();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollY = useSharedValue(0);

  // Log the autoFocus param to help with debugging
  useEffect(() => {
    console.log("Search page mounted with autoFocus:", autoFocus);
  }, [autoFocus]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout for when user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      if (text.trim()) {
        console.log("👨‍💻 User stopped typing:", text);
        processSearch(text);
      } else {
        // Clear results if query is empty
        setSearchResults([]);
      }
    }, 800) as unknown as NodeJS.Timeout;
  };

  // Process natural language query through OpenAI
  const processSearch = async (query: string) => {
    console.log("🚀 Processing search:", query);

    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Get movie title suggestions from OpenAI
      console.log("📡 Requesting AI title suggestions...");
      const titles = await generateMovieTitles(query);

      if (titles.length === 0) {
        console.log("⚠️ No titles suggested by OpenAI");
        setSearchResults([]);
        return;
      }

      console.log("🔍 Searching TMDB for suggested titles:", titles);

      // Search for all titles and combine results
      const allResults: Movie[] = [];
      const searchPromises = titles.map((title) =>
        fetchMovies({ query: title })
          .then((data) => {
            console.log(
              `📊 Found ${data.results?.length || 0} results for "${title}"`
            );
            if (data.results && data.results.length > 0) {
              allResults.push(...data.results.slice(0, 3));
            }
          })
          .catch((err) =>
            console.error(`❌ Error searching for "${title}":`, err)
          )
      );

      // Wait for all searches to complete
      await Promise.all(searchPromises);
      console.log(`🎯 Total raw results: ${allResults.length}`);

      // Remove duplicates by movie ID
      const uniqueResults = allResults.filter(
        (movie, index, self) =>
          index === self.findIndex((m) => m.id === movie.id)
      );
      console.log(
        `🎬 Unique results after deduplication: ${uniqueResults.length}`
      );

      // Sort by popularity
      uniqueResults.sort((a, b) => b.popularity - a.popularity);

      // Take top results
      const finalResults = uniqueResults.slice(0, 20);
      console.log(`📋 Final results count: ${finalResults.length}`);
      setSearchResults(finalResults);

      // Update search count with first result if available
      if (finalResults.length > 0) {
        console.log(
          "📝 Updating search count with first result:",
          finalResults[0].title || finalResults[0].name
        );
        updateSearchCount(query, finalResults[0]).catch((err) =>
          console.error("❌ Failed to update search count:", err)
        );
      }
    } catch (err) {
      console.error("❌ Search processing error:", err);
      setError(err instanceof Error ? err : new Error("Search failed"));
    } finally {
      setLoading(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y / _itemFullSize;
  });

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View className="flex-1 bg-dark-100">
      <AnimatedBackground />
      <View className="px-5 pt-20 pb-4">
        <View className="w-full flex-row justify-center items-center mb-5">
          <Image source={icons.logo} className="w-11 h-12 mb-5 mx-auto" />
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          isSearchPage={true}
        />
      </View>

      {loading && (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text className="text-white mt-4">
            Searching for the perfect match...
          </Text>
        </View>
      )}

      {error && (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-white">{error.message}</Text>
        </View>
      )}

      {!loading && !error && searchResults.length === 0 && searchQuery && (
        <View className="flex-1 justify-center items-center mt-10">
          <Image
            source={images.emptyState}
            className="w-40 h-40 opacity-50"
            resizeMode="contain"
          />
          <Text className="text-white text-center mt-4">
            No results found for "{searchQuery}"
          </Text>
        </View>
      )}

      {!loading && !error && searchResults.length > 0 && (
        <Animated.FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            padding: _spacing * 2,
            paddingTop: _spacing * 4,
            paddingBottom: (height - _itemSize) / 2,
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => (
            <AnimatedCard item={item} index={index} scrollY={scrollY} />
          )}
          snapToInterval={_itemFullSize}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Search;
