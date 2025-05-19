import React, { useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {
  fetchTVShows,
  fetchAiringTodayTVShows,
  fetchPopularTVShows,
  fetchMostPopularTVShows,
  TMDB_CONFIG,
} from "@/services/api";
import TVShowCard from "@/components/TVShowCard";
import AiringTodayCard from "@/components/AiringTodayCard";
import PopularTVCard from "@/components/PopularTVCard";
import SimpleAutoScroll from "@/components/SimpleAutoScroll";
import AnimatedBackground from "@/components/AnimatedBackground";

// Convert to class component to avoid useInsertionEffect issues
class TVPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTVShows: [],
      totalPages: 1,
      isLoadingMore: false,
      airingTodayTVShows: [],
      popularTVShows: [],
      mostPopularTVShows: [],
      pageLoaded: false,
      loading: true,
      error: null,
      currentPage: 1,
    };

    // Animation values
    this.fadeAnim = new Animated.Value(0);
    this.slideAnim = new Animated.Value(50);
    this.router = props.router;
    this.listRef = React.createRef(); // Reference to the FlatList for scrolling to top
    this.navigation = props.navigation;
  }

  componentDidMount() {
    this.loadInitialData();

    // Listen for tab press events to scroll to top
    this.tabPressListener = this.navigation.addListener("tabPress", (e) => {
      if (e.data?.scrollToTop && this.listRef.current) {
        this.listRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    });
  }

  componentWillUnmount() {
    // Clean up the listener
    if (this.tabPressListener) {
      this.tabPressListener();
    }
  }

  loadInitialData = async () => {
    try {
      // Load all data in parallel
      const [tvData, airingToday, popular, mostPopular] = await Promise.all([
        fetchTVShows({ query: "", page: 1 }),
        fetchAiringTodayTVShows(),
        fetchPopularTVShows(),
        fetchMostPopularTVShows(),
      ]);

      this.setState(
        {
          allTVShows: tvData.results,
          totalPages: tvData.total_pages,
          airingTodayTVShows: airingToday || [],
          popularTVShows: popular || [],
          mostPopularTVShows: mostPopular || [],
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

  loadMoreTVShows = async () => {
    const { isLoadingMore, currentPage, totalPages, mostPopularTVShows } =
      this.state;

    if (isLoadingMore || currentPage >= totalPages) return;

    this.setState({ isLoadingMore: true });

    try {
      const nextPage = currentPage + 1;
      // Update this to use the same endpoint as fetchMostPopularTVShows but with the next page
      const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/discover/tv?include_adult=false&language=en-US&watch_region=US&with_origin_country=US|CA&page=${nextPage}&sort_by=popularity.desc`,
        {
          method: "GET",
          headers: TMDB_CONFIG.headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch more TV shows: ${response.statusText}`
        );
      }

      const data = await response.json();
      const results = data.results;

      this.setState({
        mostPopularTVShows: [...mostPopularTVShows, ...results],
        currentPage: nextPage,
        isLoadingMore: false,
      });
    } catch (error) {
      console.error("Error loading more TV shows:", error);
      this.setState({ isLoadingMore: false });
    }
  };

  renderHeader = () => {
    const { airingTodayTVShows, popularTVShows, mostPopularTVShows } =
      this.state;

    return (
      <Animated.View
        style={{
          opacity: this.fadeAnim,
          transform: [{ translateY: this.slideAnim }],
        }}
      >
        <Image source={icons.logo} className="w-11 h-12 mt-20 mb-5 mx-auto" />

        <View className="mt-5 px-5">
          <SearchBar
            onPress={() => {
              this.router.push("/search");
            }}
            placeholder="Search for a TV show"
          />
        </View>

        {/* Airing Today TV Shows */}
        {airingTodayTVShows && airingTodayTVShows.length > 0 && (
          <View className="mt-10">
            <Text className="text-lg text-white font-bold mb-3 px-5">
              Airing Today
            </Text>
            <View style={{ height: 320, overflow: "hidden" }}>
              <SimpleAutoScroll speed={0.5} direction="left">
                {airingTodayTVShows.map((item) => (
                  <View
                    key={`airing-today-${item.id}`}
                    style={{ marginRight: 15 }}
                  >
                    <AiringTodayCard tvShow={item} />
                  </View>
                ))}
              </SimpleAutoScroll>
            </View>
          </View>
        )}

        {/* Top Rated TV Shows (previously Popular TV Shows) */}
        {popularTVShows && popularTVShows.length > 0 && (
          <View className="mt-10">
            <Text className="text-lg text-white font-bold mb-3 px-5">
              Top Rated Shows
            </Text>

            <FlatList
              data={popularTVShows}
              renderItem={({ item, index }) => (
                <PopularTVCard tvShow={item} index={index} />
              )}
              keyExtractor={(item) => item.id.toString()}
              className="mb-4 mt-3"
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="w-4" />}
              contentContainerStyle={{ paddingLeft: 20 }}
            />
          </View>
        )}

        {/* Most Popular Shows */}
        <View className="px-5 mt-5">
          <Text className="text-lg text-white font-bold mb-3">
            Most Popular Shows
          </Text>
        </View>
      </Animated.View>
    );
  };

  render() {
    const { loading, error, mostPopularTVShows, isLoadingMore } = this.state;

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
            ref={this.listRef}
            data={mostPopularTVShows}
            renderItem={({ item }) => <TVShowCard {...item} />}
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
            ListHeaderComponent={this.renderHeader}
            onEndReached={this.loadMoreTVShows}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              isLoadingMore ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
          />
        )}
      </View>
    );
  }
}

export default function TVPageWrapper(props) {
  const router = useRouter();
  const navigation = useNavigation();
  return <TVPage {...props} router={router} navigation={navigation} />;
}
