import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedBackground from "@/components/AnimatedBackground";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { getUserWatchlist, WatchlistItem } from "@/services/watchlist";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 2 - 24; // Two items per row with padding

const WatchlistScreen = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "movies" | "tv">("all");
  const router = useRouter();

  const fetchWatchlist = async () => {
    if (!isSignedIn || !user) return;

    try {
      setLoading(true);
      const data = await getUserWatchlist(user.id);
      setWatchlist(data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchWatchlist();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setRefreshing(false);
  };

  const filteredWatchlist = watchlist.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "movies") return item.mediaType === "movie";
    if (activeTab === "tv") return item.mediaType === "tv";
    return true;
  });

  const handleItemPress = (item: WatchlistItem) => {
    if (item.mediaType === "movie") {
      router.push(`/movie/${item.mediaId}`);
    } else {
      router.push(`/tv/${item.mediaId}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderWatchlistItem = ({
    item,
    index,
  }: {
    item: WatchlistItem;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="mb-6"
    >
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        className="rounded-xl overflow-hidden"
        style={{ width: ITEM_WIDTH }}
      >
        <View className="relative">
          <Image
            source={{
              uri:
                item.posterUrl ||
                "https://via.placeholder.com/500x750?text=No+Image",
            }}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_WIDTH * 1.5,
              backgroundColor: "#1f1f1f",
            }}
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            <Text className="text-white font-semibold" numberOfLines={1}>
              {item.title}
            </Text>
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-gray-300 text-xs">
                {item.addedAt
                  ? `Added On: ${new Date(item.addedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}`
                  : "N/A"}
              </Text>
              <View className="bg-purple-700 px-2 py-1 rounded">
                <Text className="text-white text-xs uppercase">
                  {item.mediaType}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <AnimatedBackground
          count={7}
          hue="blue"
          intensity={40}
          duration={30000}
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
      <AnimatedBackground
        count={7}
        hue="blue"
        intensity={40}
        duration={30000}
      />

      <SignedIn>
        <Animated.View entering={FadeIn.duration(800)} className="flex-1 pt-4">
          <View className="flex-row justify-between items-center px-6 mb-4">
            <Text className="text-white text-2xl font-bold">My Watchlist</Text>
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-white/10 rounded-full p-2"
            >
              <Feather name="log-out" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* User info section */}
          <View className="bg-black/40 mx-6 rounded-xl p-4 mb-4">
            <View className="flex-row items-center">
              <View className="bg-white/10 p-2 rounded-full mr-3">
                <Feather name="user" size={18} color="#fff" />
              </View>
              <View>
                <Text className="text-white font-semibold">
                  {user?.emailAddresses[0]?.emailAddress}
                </Text>
                <Text className="text-gray-400 text-xs">
                  Account ID: {user?.id.substring(0, 8)}...
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row bg-black/30 mx-6 rounded-xl p-1 mb-6">
            <TouchableOpacity
              onPress={() => setActiveTab("all")}
              className={`flex-1 py-2 rounded-lg ${
                activeTab === "all" ? "bg-purple-700" : "transparent"
              }`}
            >
              <Text
                className={`text-center ${
                  activeTab === "all" ? "text-white" : "text-gray-400"
                }`}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("movies")}
              className={`flex-1 py-2 rounded-lg ${
                activeTab === "movies" ? "bg-purple-700" : "transparent"
              }`}
            >
              <Text
                className={`text-center ${
                  activeTab === "movies" ? "text-white" : "text-gray-400"
                }`}
              >
                Movies
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("tv")}
              className={`flex-1 py-2 rounded-lg ${
                activeTab === "tv" ? "bg-purple-700" : "transparent"
              }`}
            >
              <Text
                className={`text-center ${
                  activeTab === "tv" ? "text-white" : "text-gray-400"
                }`}
              >
                TV Shows
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : filteredWatchlist.length === 0 ? (
            <View className="flex-1 justify-center items-center px-6">
              <Feather name="bookmark" size={64} color="#666" />
              <Text className="text-white text-xl font-semibold mt-4 text-center">
                Your watchlist is empty
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {activeTab === "all"
                  ? "Add movies and TV shows to your watchlist"
                  : activeTab === "movies"
                  ? "Add movies to your watchlist"
                  : "Add TV shows to your watchlist"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredWatchlist}
              renderItem={renderWatchlistItem}
              keyExtractor={(item) => `${item.mediaType}-${item.mediaId}`}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
                paddingHorizontal: 16,
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#fff"
                />
              }
            />
          )}
        </Animated.View>
      </SignedIn>

      <SignedOut>
        <Animated.View
          entering={FadeIn.duration(800)}
          className="flex-1 justify-center items-center px-6"
        >
          <View className="bg-black/70 rounded-3xl p-8 w-full">
            <View className="items-center mb-8">
              <View className="bg-white/10 p-4 rounded-full mb-4">
                <Feather name="bookmark" size={40} color="#fff" />
              </View>
              <Text className="text-white text-2xl font-bold">Watchlist</Text>
              <Text className="text-gray-400 text-base text-center mt-2">
                Sign in to track your favorite movies and TV shows
              </Text>
            </View>

            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="bg-purple-700 py-3 rounded-xl items-center mb-4">
                <Text className="text-white font-semibold text-lg">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="bg-transparent border border-purple-700 py-3 rounded-xl items-center">
                <Text className="text-purple-400 font-semibold text-lg">
                  Create Account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </SignedOut>
    </SafeAreaView>
  );
};

export default WatchlistScreen;
