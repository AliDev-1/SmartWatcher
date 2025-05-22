import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {
  fetchMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
} from "@/services/api";
import MovieCard from "@/components/MovieCard";
import { getTrendingMovies } from "@/services/appwrite";
import TrendingCard from "@/components/TrendingCard";
import NowPlayingCard from "@/components/NowPlayingCard";
import UpcomingCard from "@/components/UpcomingCard";
import SimpleAutoScroll from "@/components/SimpleAutoScroll";
import AnimatedBackground from "@/components/AnimatedBackground";

// Convert to class component to avoid useInsertionEffect issues
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allMovies: [],
      totalPages: 1,
      isLoadingMore: false,
      nowPlayingMovies: [],
      upcomingMovies: [],
      trendingMovies: [],
      pageLoaded: false,
      loading: true,
      error: null,
      currentPage: 1,
    };

    // Animation values
    this.fadeAnim = new Animated.Value(0);
    this.slideAnim = new Animated.Value(50);
    this.router = props.router;
  }

  componentDidMount() {
    this.loadInitialData();
  }

  loadInitialData = async () => {
    try {
      // Load all data in parallel
      const [movieData, trendingData, nowPlaying, upcoming] = await Promise.all(
        [
          fetchMovies({ query: "", page: 1 }),
          getTrendingMovies(),
          fetchNowPlayingMovies(),
          fetchUpcomingMovies(),
        ]
      );

      console.log(
        `Now playing: ${nowPlaying.length}, Upcoming: ${upcoming.length}`
      );

      this.setState(
        {
          allMovies: movieData.results,
          totalPages: movieData.total_pages,
          trendingMovies: trendingData || [],
          nowPlayingMovies: nowPlaying || [],
          upcomingMovies: upcoming || [],
          loading: false,
        },
        this.startAnimations
      );
    } catch (error) {
      console.error("Error loading data:", error);
      this.setState({ loading: false, error });
    }
  };

  startAnimations = () => {
    Animated.parallel([
      Animated.timing(this.fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(this.slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(() => {
      this.setState({ pageLoaded: true });
    });
  };

  loadMoreMovies = async () => {
    const { isLoadingMore, currentPage, totalPages, allMovies } = this.state;

    if (isLoadingMore || currentPage >= totalPages) return;

    this.setState({ isLoadingMore: true });

    try {
      const nextPage = currentPage + 1;
      const { results } = await fetchMovies({ query: "", page: nextPage });

      this.setState({
        allMovies: [...allMovies, ...results],
        currentPage: nextPage,
        isLoadingMore: false,
      });
    } catch (error) {
      console.error("Error loading more movies:", error);
      this.setState({ isLoadingMore: false });
    }
  };

  renderHeader = () => {
    const { nowPlayingMovies, trendingMovies, upcomingMovies } = this.state;

    return (
      <Animated.View
        style={{
          opacity: this.fadeAnim,
          transform: [{ translateY: this.slideAnim }],
        }}
      >
        <Image source={icons.logo} className="w-11 h-12 mt-20 mb-5 mx-auto" />

        <View className="mt-5 px-5">
          <SearchBar />
        </View>

        {/* Now Playing Movies */}
        {nowPlayingMovies && nowPlayingMovies.length > 0 && (
          <View className="mt-10">
            <Text className="text-lg text-white font-bold mb-3 px-5">
              Now Playing in Theaters
            </Text>
            <View style={{ height: 320, overflow: "hidden" }}>
              <SimpleAutoScroll speed={0.5} direction="left">
                {nowPlayingMovies.map((item) => (
                  <View
                    key={`now-playing-${item.id}`}
                    style={{ marginRight: 15 }}
                  >
                    <NowPlayingCard movie={item} />
                  </View>
                ))}
              </SimpleAutoScroll>
            </View>
          </View>
        )}

        {/* Trending Movies */}
        {trendingMovies && trendingMovies.length > 0 && (
          <View className="mt-10">
            <Text className="text-lg text-white font-bold mb-3 px-5">
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
              contentContainerStyle={{ paddingLeft: 20 }}
            />
          </View>
        )}

        {/* Upcoming Movies */}
        {upcomingMovies && upcomingMovies.length > 0 && (
          <View className="mt-8">
            <Text className="text-lg text-white font-bold mb-3 px-5">
              Coming Soon
            </Text>
            <View style={{ height: 180, overflow: "hidden", marginBottom: 10 }}>
              <SimpleAutoScroll
                speed={0.5}
                direction="left"
                style={{ paddingHorizontal: 20 }}
              >
                {upcomingMovies.map((item) => (
                  <View key={`upcoming-${item.id}`} style={{ marginRight: 15 }}>
                    <UpcomingCard movie={item} />
                  </View>
                ))}
              </SimpleAutoScroll>
            </View>
          </View>
        )}

        <View className="px-5 mt-5">
          <Text className="text-lg text-white font-bold mb-3">
            Latest Movies
          </Text>
        </View>
      </Animated.View>
    );
  };

  render() {
    const { loading, error, allMovies, isLoadingMore } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: "transparent" }}>
        <AnimatedBackground
          count={7}
          hue="blue"
          intensity={40}
          duration={30000}
        />
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-40 self-center"
          />
        ) : error ? (
          <Text className="text-red-500 mt-40 text-center px-5">
            Error: {error.message}
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
            onEndReached={this.loadMoreMovies}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={this.renderHeader}
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
}

// Wrap with useRouter for navigation
export default function IndexWrapper(props) {
  const router = useRouter();
  return <Index router={router} />;
}
