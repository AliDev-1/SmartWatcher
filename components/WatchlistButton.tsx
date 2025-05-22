import React, { useEffect, useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  BounceIn,
  ZoomOut,
  FadeIn,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/services/watchlist";

interface WatchlistButtonProps {
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterUrl?: string;
}

const WatchlistButton = ({
  mediaId,
  mediaType,
  title,
  posterUrl,
}: WatchlistButtonProps) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Check if media is in watchlist when component mounts
  useEffect(() => {
    const checkWatchlist = async () => {
      if (isSignedIn && user) {
        try {
          const result = await isInWatchlist(user.id, mediaId, mediaType);
          setInWatchlist(result);
        } catch (error) {
          console.error("Error checking watchlist:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (isLoaded) {
      checkWatchlist();
    }
  }, [isLoaded, isSignedIn, user, mediaId, mediaType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  const triggerAddAnimation = () => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 200 }),
      withSpring(1)
    );
    rotation.value = withSequence(
      withTiming(-15, { duration: 100 }),
      withTiming(15, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  };

  const triggerRemoveAnimation = () => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 200 }),
      withSpring(1)
    );
  };

  const handleToggleWatchlist = async () => {
    if (!isSignedIn || !user) return;

    setLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(user.id, mediaId, mediaType);
        triggerRemoveAnimation();
        setInWatchlist(false);
      } else {
        await addToWatchlist({
          userId: user.id,
          mediaId,
          mediaType,
          title,
          posterUrl,
        });
        triggerAddAnimation();
        setInWatchlist(true);
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <ActivityIndicator size="small" color="#fff" />;
  }

  if (!isSignedIn) {
    return (
      <Link href="/(auth)/sign-in" asChild>
        <TouchableOpacity className="bg-black/50 rounded-full p-3">
          <Animated.View entering={FadeIn.duration(300)}>
            <Feather name="bookmark" size={24} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity
      className={`rounded-full p-3 ${
        inWatchlist ? "bg-purple-700" : "bg-black/50"
      }`}
      onPress={handleToggleWatchlist}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Animated.View style={animatedStyle}>
          <Feather
            name={inWatchlist ? "bookmark" : "bookmark"}
            size={24}
            color="#fff"
          />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

export default WatchlistButton;
