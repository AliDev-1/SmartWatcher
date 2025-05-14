import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import MovieCard from "@/components/MovieCard";
import { getTrendingMovies } from "@/services/appwrite";
import TrendingCard from "@/components/TrendingCard";
import React, { useState, useCallback } from "react";

export default function Index() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data: trendingMovies = [],
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);

  const {
    data: movieData,
    loading: initialLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(async () => {
    const result = await fetchMovies({ query: "", page: 1 });
    setAllMovies(result.results);
    setTotalPages(result.total_pages);
    return result;
  });

  const loadMoreMovies = useCallback(async () => {
    if (isLoadingMore || page >= totalPages) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const { results } = await fetchMovies({ query: "", page: nextPage });
      setAllMovies((prev) => [...prev, ...results]);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more movies:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, totalPages]);

  const renderHeader = () => (
    <>
      <Image source={icons.logo} className="w-11 h-12 mt-20 mb-5 mx-auto" />

      <View className="mt-5 px-5">
        <SearchBar
          onPress={() => {
            router.push("/search");
          }}
          placeholder="Search for a movie"
        />
      </View>

      {trendingMovies && trendingMovies.length > 0 && (
        <View className="mt-10 px-5">
          <Text className="text-lg text-white font-bold mb-3">
            Trending Movies
          </Text>

          <FlatList
            data={trendingMovies}
            renderItem={({ item, index }) => (
              <TrendingCard movie={item} index={index} />
            )}
            keyExtractor={(item) => item.movie_id.toString()}
            className="mb-4 mt-3"
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="w-4" />}
          />
        </View>
      )}

      <View className="px-5">
        <Text className="text-lg text-white font-bold mt-5 mb-3">
          Latest Movies
        </Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      {initialLoading || trendingLoading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          className="mt-40 self-center"
        />
      ) : moviesError || trendingError ? (
        <Text className="text-red-500 mt-40 text-center px-5">
          Error: {moviesError?.message || trendingError?.message}
        </Text>
      ) : (
        <FlatList
          data={allMovies}
          renderItem={({ item }) => <MovieCard {...item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={{ paddingBottom: 100 }}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 20,
            paddingHorizontal: 20,
            marginBottom: 10,
          }}
          className="mt-2"
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-5"
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
