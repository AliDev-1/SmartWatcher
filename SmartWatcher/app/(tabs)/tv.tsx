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
import { useRouter } from "expo-router";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {
  fetchTVShows,
  fetchAiringTodayTVShows,
  fetchPopularTVShows,
} from "@/services/api";
import TVShowCard from "@/components/TVShowCard";
import AiringTodayCard from "@/components/AiringTodayCard";
import PopularTVCard from "@/components/PopularTVCard";
import SimpleAutoScroll from "@/components/SimpleAutoScroll";

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
      const [tvData, airingToday, popular] = await Promise.all([
        fetchTVShows({ query: "", page: 1 }),
        fetchAiringTodayTVShows(),
        fetchPopularTVShows(),
      ]);

      this.setState(
        {
          allTVShows: tvData.results,
          totalPages: tvData.total_pages,
          airingTodayTVShows: airingToday || [],
          popularTVShows: popular || [],
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
    const { isLoadingMore, currentPage, totalPages, allTVShows } = this.state;

    if (isLoadingMore || currentPage >= totalPages) return;

    this.setState({ isLoadingMore: true });

    try {
      const nextPage = currentPage + 1;
      const { results } = await fetchTVShows({ query: "", page: nextPage });

      this.setState({
        allTVShows: [...allTVShows, ...results],
        currentPage: nextPage,
        isLoadingMore: false,
      });
    } catch (error) {
      console.error("Error loading more TV shows:", error);
      this.setState({ isLoadingMore: false });
    }
  };

  renderHeader = () => {
    const { airingTodayTVShows, popularTVShows } = this.state;

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

        {/* Popular TV Shows */}
        {popularTVShows && popularTVShows.length > 0 && (
          <View className="mt-10">
            <Text className="text-lg text-white font-bold mb-3 px-5">
              Popular TV Shows
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

        <View className="px-5 mt-5">
          <Text className="text-lg text-white font-bold mb-3">
            Latest TV Shows
          </Text>
        </View>
      </Animated.View>
    );
  };

  render() {
    const { loading, error, allTVShows, isLoadingMore } = this.state;

    return (
      <View className="flex-1 bg-primary">
        <Image
          source={images.bg}
          className="absolute w-full z-0"
          resizeMode="cover"
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
            data={allTVShows}
            renderItem={({ item }) => <TVShowCard {...item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 100 }}
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
  return <TVPage {...props} router={router} />;
}
