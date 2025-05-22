import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInRight,
  StretchInX,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

import { icons } from "@/constants/icons";
import useFetch from "@/services/useFetch";
import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieVideos,
  fetchMovieWatchProviders,
  fetchMovieReviews,
  fetchMovieRecommendations,
} from "@/services/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import WatchlistButton from "@/components/WatchlistButton";

const { width, height } = Dimensions.get("screen");

// Theme colors based on app's tailwind config
const colors = {
  primary: "#030014",
  secondary: "#151312",
  header: "#151312",
  headerText: "#ffffff",
  tab: "#221F3D",
  tabText: "#9CA4AB",
  accent: "#AB8BFF",
  text: "#9CA4AB",
  white: "#ffffff",
};

const _headerHeight = height * 0.5;
const _headerHeightShrink = height * 0.2;
const _tabsHeight = 50; // Reduced from 60 to make tabs slimmer
const _tabsHeightShrink = _tabsHeight;

const inputRange = [0, _headerHeightShrink];

// Add type definitions
interface MovieType {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  budget: number;
  revenue: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
}

interface CreditsType {
  id: number;
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

interface HeaderProps {
  scrollY: Animated.SharedValue<number>;
  movie: MovieType | null;
}

interface TabsProps {
  scrollY: Animated.SharedValue<number>;
  activeTab: number;
  setActiveTab: (index: number) => void;
}

interface PersonCardProps {
  person: {
    id: number;
    name: string;
    profile_path: string | null;
    character?: string;
    job?: string;
  };
}

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

interface VideoCardProps {
  video: {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
    published_at: string;
  };
  index: number;
}

// Interface for streaming provider
interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

// Interface for recommendations
interface MovieRecommendation {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

// Country list for region selection
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
];

// Header Component
const Header = ({ scrollY, movie }: HeaderProps) => {
  const router = useRouter();

  const stylez = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        inputRange,
        [_headerHeight, _headerHeightShrink],
        Extrapolation.CLAMP
      ),
    };
  });

  const headerTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        inputRange,
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            inputRange,
            [0, -_headerHeight],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const backdropPath = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${movie?.poster_path}`;

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.header,
          justifyContent: "flex-end",
        },
        stylez,
      ]}
    >
      <Image
        source={{ uri: backdropPath }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={StyleSheet.absoluteFillObject} className="bg-black/50" />

      <TouchableOpacity
        className="absolute top-12 left-5 z-10 bg-black/50 rounded-full p-2"
        onPress={router.back}
      >
        <Feather name="chevron-left" size={24} color={colors.white} />
      </TouchableOpacity>

      {movie && (
        <View className="absolute top-12 right-5 z-10">
          <WatchlistButton
            mediaId={movie.id.toString()}
            mediaType="movie"
            title={movie.title}
            posterUrl={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : undefined
            }
            year={movie.release_date?.slice(0, 4)}
          />
        </View>
      )}

      <Animated.View style={headerTextStyle} className="px-5 pb-8">
        <Text className="text-white font-bold text-4xl" numberOfLines={2}>
          {movie?.title}
        </Text>

        <View className="flex-row items-center gap-x-2 mt-2">
          <Text className="text-white text-sm">{movie?.release_date}</Text>
          <View className="h-1 w-1 bg-white rounded-full" />
          <Text className="text-white text-sm">
            {movie?.runtime ? `${movie?.runtime} min` : "N/A"}
          </Text>
        </View>

        <View className="flex-row items-center gap-x-2 mt-3">
          {movie?.vote_average && (
            <View className="flex-row items-center gap-x-1">
              <Image source={icons.star} className="w-4 h-4" />
              <Text className="text-white text-sm">
                {movie?.vote_average.toFixed(1)}
              </Text>
            </View>
          )}

          {movie?.genres?.slice(0, 3).map((genre) => (
            <View key={genre.id} className="px-2 py-1 bg-white/20 rounded-full">
              <Text className="text-white text-xs">{genre.name}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// Tabs Component
const tabs = [
  "Details",
  "Cast & Crew",
  "Videos",
  "Where to Watch",
  "Reviews",
  "Recommendations",
];

const Tabs = ({ scrollY, activeTab, setActiveTab }: TabsProps) => {
  const stylez = useAnimatedStyle(() => {
    return {
      height: _tabsHeight,
      marginTop: interpolate(
        scrollY.value,
        inputRange,
        [0, -_tabsHeightShrink / 2],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.tab,
        },
        stylez,
      ]}
      className="px-2"
    >
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 5 }}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(index)}
            className="px-4 py-3"
          >
            <Text
              style={{
                color: activeTab === index ? colors.accent : colors.tabText,
                fontWeight: activeTab === index ? "700" : "500",
              }}
              className="text-base"
            >
              {tab}
            </Text>

            {activeTab === index && (
              <View
                className="mt-1 h-0.5"
                style={{ backgroundColor: colors.accent, width: "100%" }}
              />
            )}
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
};

// Movie Info Component
const MovieInfo = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <View className="mb-4">
    <Text className="text-text font-medium text-sm">{label}</Text>
    <Text className="text-white font-medium text-sm mt-1">
      {value || "N/A"}
    </Text>
  </View>
);

// Cast Card Component
const CastCard = ({ person }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="mr-4 w-24"
      onPress={() => router.push(`/person/${person.id}`)}
    >
      <Image
        source={{
          uri: person.profile_path
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
            : "https://via.placeholder.com/185x278/151312/9CA4AB?text=No+Image",
        }}
        className="w-24 h-32 rounded-md"
        resizeMode="cover"
      />
      <Text className="text-white text-xs font-bold mt-1" numberOfLines={1}>
        {person.name}
      </Text>
      <Text className="text-text text-xs" numberOfLines={1}>
        {person.character}
      </Text>
    </TouchableOpacity>
  );
};

// Crew Card Component
const CrewCard = ({ person }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="mr-4 w-24"
      onPress={() => router.push(`/person/${person.id}`)}
    >
      <Image
        source={{
          uri: person.profile_path
            ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
            : "https://via.placeholder.com/185x278/151312/9CA4AB?text=No+Image",
        }}
        className="w-24 h-32 rounded-md"
        resizeMode="cover"
      />
      <Text className="text-white text-xs font-bold mt-1" numberOfLines={1}>
        {person.name}
      </Text>
      <Text className="text-text text-xs" numberOfLines={1}>
        {person.job}
      </Text>
    </TouchableOpacity>
  );
};

// Video Card Component
const VideoCard = ({ video, index }) => {
  const scaleAnim = useSharedValue(1);
  const cardRef = useRef(null);

  const handlePress = async () => {
    scaleAnim.value = withSpring(0.95, { damping: 10 }, () => {
      scaleAnim.value = withSpring(1);
    });

    if (video.site === "YouTube") {
      const youtubeUrl = `https://www.youtube.com/watch?v=${video.key}`;
      try {
        await Linking.openURL(youtubeUrl);
      } catch (error) {
        console.error("Error opening YouTube video:", error);
      }
    }
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const thumbnailUrl = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
  const videoTypeColor =
    video.type === "Trailer"
      ? colors.accent
      : video.type === "Teaser"
      ? "#2196F3"
      : "#4CAF50";

  return (
    <Animated.View
      entering={FadeIn.delay(100 * index).springify()}
      style={cardStyle}
      className="mb-5 rounded-lg overflow-hidden"
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        className="w-full"
      >
        <View className="relative">
          <Image
            source={{ uri: thumbnailUrl }}
            className="w-full h-48 rounded-lg"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            className="absolute bottom-0 left-0 right-0 h-1/2"
          />

          <View className="absolute inset-0 flex items-center justify-center">
            <View className="bg-black/50 rounded-full p-4">
              <Feather name="play" size={30} color="white" />
            </View>
          </View>

          <View className="absolute bottom-3 left-3 right-3">
            <Text className="text-white font-bold text-base" numberOfLines={2}>
              {video.name}
            </Text>

            <View className="flex-row items-center justify-between mt-1">
              <View
                style={{ backgroundColor: videoTypeColor }}
                className="px-2 py-1 rounded-md"
              >
                <Text className="text-white text-xs font-medium">
                  {video.type}
                </Text>
              </View>

              <Text className="text-white text-xs">
                {new Date(video.published_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Provider Card Component
const ProviderCard = ({ provider, link }) => {
  const handlePress = () => {
    if (link) {
      Linking.openURL(link);
    }
  };

  return (
    <TouchableOpacity
      className="mr-4 items-center"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        entering={FadeIn.delay(100).springify()}
        className="w-16 h-16 rounded-lg mb-1 overflow-hidden"
        style={{ backgroundColor: colors.secondary }}
      >
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
          }}
          className="w-16 h-16"
          resizeMode="contain"
        />
      </Animated.View>
      <Text className="text-white text-xs text-center" numberOfLines={2}>
        {provider.provider_name}
      </Text>
    </TouchableOpacity>
  );
};

// Review Card Component
const ReviewCard = ({ review, index, onPress }) => {
  const isLongContent = review.content.length > 200;
  const displayContent = isLongContent
    ? review.content.substring(0, 200) + "..."
    : review.content;

  const cardScale = useSharedValue(1);

  const handlePressIn = () => {
    cardScale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1);
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get avatar URL (handle null paths or paths with or without leading /)
  const getAvatarUrl = () => {
    if (!review.author_details.avatar_path) {
      return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp";
    }

    if (review.author_details.avatar_path.startsWith("/http")) {
      return review.author_details.avatar_path.substring(1);
    }

    return `https://image.tmdb.org/t/p/w100_and_h100_face${review.author_details.avatar_path}`;
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
      style={animatedCardStyle}
      className="bg-secondary mb-4 rounded-lg overflow-hidden"
    >
      <Pressable
        onPress={() => onPress(review)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="p-4"
      >
        <View className="flex-row items-center mb-3">
          <Image
            source={{ uri: getAvatarUrl() }}
            className="w-10 h-10 rounded-full"
            resizeMode="cover"
          />
          <View className="ml-2 flex-1">
            <Text className="text-white font-bold text-sm">
              {review.author}
            </Text>
            <Text className="text-text text-xs">
              {formatDate(review.created_at)}
            </Text>
          </View>
          {review.author_details.rating && (
            <View className="bg-ratingBox px-2 py-1 rounded-md">
              <Text className="text-white font-bold text-xs">
                {review.author_details.rating}/10
              </Text>
            </View>
          )}
        </View>

        <Text className="text-white text-sm leading-5">{displayContent}</Text>

        {isLongContent && (
          <Text className="text-accent text-xs mt-2">Read more</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Full Review Modal
const FullReviewModal = ({ review, isVisible, onClose }) => {
  if (!review) return null;

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    if (!review.author_details.avatar_path) {
      return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp";
    }

    if (review.author_details.avatar_path.startsWith("/http")) {
      return review.author_details.avatar_path.substring(1);
    }

    return `https://image.tmdb.org/t/p/w100_and_h100_face${review.author_details.avatar_path}`;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      >
        <View className="bg-primary rounded-t-xl max-h-[80%]">
          <View className="p-4 border-b border-secondary flex-row justify-between items-center">
            <Text className="text-white font-bold text-lg">Review</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="p-4"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: getAvatarUrl() }}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
              />
              <View className="ml-3 flex-1">
                <Text className="text-white font-bold text-base">
                  {review.author}
                </Text>
                <Text className="text-text text-xs">
                  {formatDate(review.created_at)}
                </Text>
              </View>
              {review.author_details.rating && (
                <View className="bg-accent px-3 py-1.5 rounded-md">
                  <Text className="text-white font-bold text-base">
                    {review.author_details.rating}/10
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-white text-base leading-6">
              {review.content}
            </Text>

            {review.url && (
              <TouchableOpacity
                onPress={() => Linking.openURL(review.url)}
                className="mt-6 p-3 bg-secondary rounded-md flex-row justify-center items-center"
              >
                <Feather name="external-link" size={16} color={colors.accent} />
                <Text className="text-accent ml-2">View on TMDB</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Region Selection Modal
const RegionModal = ({
  isVisible,
  onClose,
  selectedRegion,
  onSelectRegion,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      >
        <View className="bg-primary rounded-t-xl">
          <View className="p-4 border-b border-secondary flex-row justify-between items-center">
            <Text className="text-white font-bold text-lg">Select Region</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-96">
            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.code}
                className={`p-4 border-b border-secondary flex-row justify-between items-center ${
                  country.code === selectedRegion ? "bg-secondary/50" : ""
                }`}
                onPress={() => {
                  onSelectRegion(country.code);
                  onClose();
                }}
              >
                <Text className="text-white text-base">{country.name}</Text>
                {country.code === selectedRegion && (
                  <Feather name="check" size={20} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Movie Recommendation Card
const MovieRecommendationCard = ({ movie, index }) => {
  const router = useRouter();
  const cardScale = useSharedValue(1);

  // Calculate position in grid
  const row = Math.floor(index / 3);
  const col = index % 3;

  const handlePressIn = () => {
    cardScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split("-")[0]; // Just get the year
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).springify()}
      style={[
        animatedStyle,
        {
          width: (width - 58) / 3,
          marginBottom: 16,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/movie/${movie.id}`)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View className="rounded-lg overflow-hidden border border-secondary/40">
          <Image
            source={{
              uri: movie.poster_path
                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                : "https://via.placeholder.com/342x513/151312/9CA4AB?text=No+Image",
            }}
            className="w-full aspect-[2/3]"
            resizeMode="cover"
          />
        </View>
        <View className="mt-2">
          <Text className="text-white text-xs font-bold" numberOfLines={2}>
            {movie.title}
          </Text>
          <View className="flex-row items-center mt-1">
            {movie.vote_average > 0 && (
              <View className="flex-row items-center">
                <Image source={icons.star} className="w-3 h-3" />
                <Text className="text-text text-xs ml-1">
                  {movie.vote_average.toFixed(1)}
                </Text>
              </View>
            )}
            {movie.release_date && (
              <Text className="text-text text-xs ml-2">
                {formatDate(movie.release_date)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Component
const Details = () => {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const scrollY = useSharedValue(0);

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  const { data: credits, loading: creditsLoading } = useFetch(() =>
    fetchMovieCredits(id as string)
  );

  const { data: videos, loading: videosLoading } = useFetch(() =>
    fetchMovieVideos(id as string)
  );

  const { data: watchProviders, loading: providersLoading } = useFetch(() =>
    fetchMovieWatchProviders(id as string)
  );

  const { data: reviews, loading: reviewsLoading } = useFetch(() =>
    fetchMovieReviews(id as string)
  );

  const { data: recommendations, loading: recommendationsLoading } = useFetch(
    () => fetchMovieRecommendations(id as string)
  );

  const onScroll = useAnimatedScrollHandler((ev) => {
    scrollY.value = ev.contentOffset.y;
  });

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        className="items-center justify-center"
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  const directors =
    credits?.crew?.filter((person) => person.job === "Director") || [];
  const writers =
    credits?.crew?.filter(
      (person) =>
        person.department === "Writing" ||
        person.job === "Screenplay" ||
        person.job === "Writer"
    ) || [];

  const importantCrew = [...directors, ...writers.slice(0, 2)];
  const cast = credits?.cast?.slice(0, 20) || [];
  const keyProductionCrew =
    credits?.crew
      ?.filter((person) =>
        [
          "Director",
          "Producer",
          "Director of Photography",
          "Production Design",
          "Costume Design",
        ].includes(person.job)
      )
      .slice(0, 10) || [];

  const trailers =
    videos?.results?.filter(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    ) || [];

  const teasers =
    videos?.results?.filter(
      (video) => video.site === "YouTube" && video.type === "Teaser"
    ) || [];

  const otherVideos =
    videos?.results?.filter(
      (video) =>
        video.site === "YouTube" &&
        video.type !== "Trailer" &&
        video.type !== "Teaser"
    ) || [];

  const allVideos = [...trailers, ...teasers, ...otherVideos];

  const hasVideos = allVideos.length > 0;

  // Extract providers data
  const providers = watchProviders?.results?.[selectedRegion];

  const streamingProviders = providers?.flatrate || [];
  const rentProviders = providers?.rent || [];
  const buyProviders = providers?.buy || [];

  const hasProviders =
    streamingProviders.length > 0 ||
    rentProviders.length > 0 ||
    buyProviders.length > 0;

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
  };

  // Don't show the trailer button when Videos tab is active
  const showTrailerButton = activeTab !== 2;

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <AnimatedBackground
        count={7}
        hue="blue"
        intensity={40}
        duration={30000}
      />

      <FullReviewModal
        review={selectedReview}
        isVisible={reviewModalVisible}
        onClose={closeReviewModal}
      />

      <RegionModal
        isVisible={regionModalVisible}
        onClose={() => setRegionModalVisible(false)}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: 80,
          paddingTop: _headerHeight + _tabsHeight,
        }}
        className="z-0"
      >
        {activeTab === 0 && (
          // Details Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            {importantCrew.length > 0 && (
              <Text className="text-white text-sm mb-1">
                {importantCrew.map(
                  (p, i) =>
                    `${p.job}: ${p.name}${
                      i < importantCrew.length - 1 ? " • " : ""
                    }`
                )}
              </Text>
            )}

            <Text className="text-white text-base mt-4 mb-5 leading-6">
              {movie?.overview}
            </Text>

            <View className="flex-row flex-wrap">
              <View className="w-1/2 pr-2">
                <MovieInfo
                  label="Budget"
                  value={
                    movie?.budget && movie.budget > 0
                      ? `$${(movie.budget / 1_000_000).toFixed(1)} million`
                      : "N/A"
                  }
                />
              </View>
              <View className="w-1/2 pl-2">
                <MovieInfo
                  label="Revenue"
                  value={
                    movie?.revenue && movie.revenue > 0
                      ? `$${(movie.revenue / 1_000_000).toFixed(1)} million`
                      : "N/A"
                  }
                />
              </View>

              <View className="w-1/2 pr-2">
                <MovieInfo
                  label="Release Date"
                  value={movie?.release_date || "N/A"}
                />
              </View>
              <View className="w-1/2 pl-2">
                <MovieInfo
                  label="Runtime"
                  value={movie?.runtime ? `${movie.runtime} minutes` : "N/A"}
                />
              </View>
            </View>

            <MovieInfo
              label="Production Companies"
              value={movie?.production_companies?.map((c) => c.name).join(", ")}
            />
          </View>
        )}

        {activeTab === 1 && (
          // Cast & Crew Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            <Text className="text-white font-bold text-lg mb-3">Cast</Text>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {creditsLoading ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                cast.map((person) => (
                  <CastCard key={`cast-${person.id}`} person={person} />
                ))
              )}
            </Animated.ScrollView>

            <Text className="text-white font-bold text-lg mb-3 mt-2">
              Key Crew
            </Text>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {creditsLoading ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                keyProductionCrew.map((person) => (
                  <CrewCard
                    key={`crew-${person.id}-${person.job}`}
                    person={person}
                  />
                ))
              )}
            </Animated.ScrollView>
          </View>
        )}

        {activeTab === 2 && (
          // Videos Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            {videosLoading ? (
              <View className="items-center justify-center pt-10">
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : !hasVideos ? (
              <View className="items-center justify-center pt-10">
                <Feather name="video-off" size={48} color={colors.tabText} />
                <Text className="text-tabText text-base mt-3">
                  No videos available
                </Text>
              </View>
            ) : (
              <>
                {trailers.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-bold text-lg mb-3">
                      Trailers
                    </Text>
                    {trailers.map((video, index) => (
                      <VideoCard
                        key={`trailer-${video.id}`}
                        video={video}
                        index={index}
                      />
                    ))}
                  </View>
                )}

                {teasers.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-bold text-lg mb-3">
                      Teasers
                    </Text>
                    {teasers.map((video, index) => (
                      <VideoCard
                        key={`teaser-${video.id}`}
                        video={video}
                        index={index}
                      />
                    ))}
                  </View>
                )}

                {otherVideos.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-bold text-lg mb-3">
                      Other Videos
                    </Text>
                    {otherVideos.map((video, index) => (
                      <VideoCard
                        key={`other-${video.id}`}
                        video={video}
                        index={index}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 3 && (
          // Where to Watch Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            {providersLoading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator color={colors.accent} size="large" />
                <Text className="text-tabText text-base mt-3">
                  Loading streaming options...
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-white font-bold text-2xl">
                    Watch Options
                  </Text>

                  <TouchableOpacity
                    onPress={() => setRegionModalVisible(true)}
                    className="flex-row items-center bg-secondary/80 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-white text-sm mr-1">
                      {selectedRegion}
                    </Text>
                    <Feather
                      name="chevron-down"
                      size={16}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>

                {!providers || !hasProviders ? (
                  <View className="items-center justify-center py-10">
                    <Feather name="tv" size={48} color={colors.tabText} />
                    <Text className="text-tabText text-base mt-3 text-center">
                      No streaming information available in this region
                    </Text>
                  </View>
                ) : (
                  <>
                    {streamingProviders.length > 0 && (
                      <View className="mb-8">
                        <View className="flex-row items-center mb-4">
                          <Feather
                            name="play-circle"
                            size={20}
                            color={colors.accent}
                          />
                          <Text className="text-white font-bold text-lg ml-2">
                            Stream
                          </Text>
                        </View>
                        <Text className="text-text text-sm mb-4">
                          Watch with a subscription
                        </Text>
                        <Animated.ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="pb-2"
                        >
                          {streamingProviders.map((provider) => (
                            <ProviderCard
                              key={`stream-${provider.provider_id}`}
                              provider={provider}
                              link={providers.link}
                            />
                          ))}
                        </Animated.ScrollView>
                      </View>
                    )}

                    {rentProviders.length > 0 && (
                      <View className="mb-8">
                        <View className="flex-row items-center mb-4">
                          <Feather
                            name="dollar-sign"
                            size={20}
                            color={colors.accent}
                          />
                          <Text className="text-white font-bold text-lg ml-2">
                            Rent
                          </Text>
                        </View>
                        <Text className="text-text text-sm mb-4">
                          Pay to rent
                        </Text>
                        <Animated.ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="pb-2"
                        >
                          {rentProviders.map((provider) => (
                            <ProviderCard
                              key={`rent-${provider.provider_id}`}
                              provider={provider}
                              link={providers.link}
                            />
                          ))}
                        </Animated.ScrollView>
                      </View>
                    )}

                    {buyProviders.length > 0 && (
                      <View className="mb-8">
                        <View className="flex-row items-center mb-4">
                          <Feather
                            name="shopping-cart"
                            size={20}
                            color={colors.accent}
                          />
                          <Text className="text-white font-bold text-lg ml-2">
                            Buy
                          </Text>
                        </View>
                        <Text className="text-text text-sm mb-4">
                          Purchase to own
                        </Text>
                        <Animated.ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="pb-2"
                        >
                          {buyProviders.map((provider) => (
                            <ProviderCard
                              key={`buy-${provider.provider_id}`}
                              provider={provider}
                              link={providers.link}
                            />
                          ))}
                        </Animated.ScrollView>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}

        {activeTab === 4 && (
          // Reviews Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            {reviewsLoading ? (
              <View className="items-center justify-center pt-10">
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : !reviews?.results || reviews.results.length === 0 ? (
              <View className="items-center justify-center pt-10">
                <Feather
                  name="message-square"
                  size={48}
                  color={colors.tabText}
                />
                <Text className="text-tabText text-base mt-3">
                  No reviews available
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-white font-bold text-xl mb-4">
                  User Reviews
                </Text>

                {reviews.results.map((review, index) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    index={index}
                    onPress={openReviewModal}
                  />
                ))}

                <View className="mt-2 mb-8 flex items-center">
                  <Text className="text-text text-sm">
                    {reviews.total_results} review
                    {reviews.total_results !== 1 ? "s" : ""} in total
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 5 && (
          // Recommendations Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            <Text className="text-white font-bold text-xl mb-5">
              You May Also Like
            </Text>

            {recommendationsLoading ? (
              <View className="items-center justify-center pt-10">
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : !recommendations?.results ||
              recommendations.results.length === 0 ? (
              <View className="items-center justify-center pt-10">
                <Feather name="film" size={48} color={colors.tabText} />
                <Text className="text-tabText text-base mt-3">
                  No recommendations available
                </Text>
              </View>
            ) : (
              <View>
                {[0, 1, 2, 3].map((row) => (
                  <View
                    key={`row-${row}`}
                    className="flex-row"
                    style={{
                      marginBottom: 4,
                      justifyContent: "flex-start",
                      gap: 8,
                    }}
                  >
                    {[0, 1, 2].map((col) => {
                      const index = row * 3 + col;
                      if (
                        index < recommendations.results.length &&
                        index < 12
                      ) {
                        return (
                          <MovieRecommendationCard
                            key={recommendations.results[index].id}
                            movie={recommendations.results[index]}
                            index={index}
                          />
                        );
                      }
                      // Return empty placeholder if we don't have enough movies to fill the grid
                      return (
                        <View
                          key={`empty-${row}-${col}`}
                          style={{ width: (width - 58) / 3 }}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </Animated.ScrollView>

      <View style={{ position: "absolute", width: "100%" }}>
        <Header scrollY={scrollY} movie={movie} />
        <Tabs
          scrollY={scrollY}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </View>

      {showTrailerButton && (
        <TouchableOpacity
          className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 5,
            backgroundColor: colors.accent,
          }}
          onPress={() => {
            if (trailers.length > 0) {
              const firstTrailer = trailers[0];
              Linking.openURL(
                `https://www.youtube.com/watch?v=${firstTrailer.key}`
              );
            } else if (allVideos.length > 0) {
              const firstVideo = allVideos[0];
              Linking.openURL(
                `https://www.youtube.com/watch?v=${firstVideo.key}`
              );
            }
          }}
        >
          <Image
            source={icons.play}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
            tintColor="#FFF"
          />
          <Text className="text-white font-semibold text-base">
            Watch Trailer
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Details;
