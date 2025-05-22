import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Keyboard,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useRef, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  withSequence,
  Easing,
} from "react-native-reanimated";

import { icons } from "@/constants/icons";

const { width } = Dimensions.get("window");
const PLACEHOLDER_TEXT =
  "What are you in the mood for today? Search naturally...";

interface Props {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  autoFocus?: boolean;
  isSearchPage?: boolean;
}

const SearchBar = ({
  value,
  onChangeText,
  onPress,
  autoFocus = false,
  isSearchPage = false,
}: Props) => {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  // Animation values for the glow effect
  const glowAnimation = useSharedValue(0);

  // Start the animation when component mounts
  useEffect(() => {
    // Start the animation
    startGlowAnimation();
  }, []);

  const startGlowAnimation = () => {
    glowAnimation.value = 0;
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
  };

  // Create the animated style for the glow effect
  const animatedGlowStyle = useAnimatedStyle(() => {
    // Use different color ranges for a multicolor effect
    const color = interpolateColor(
      glowAnimation.value,
      [0, 0.25, 0.5, 0.75, 1],
      [
        "rgba(171, 139, 255, 0.8)", // Purple
        "rgba(255, 139, 203, 0.8)", // Pink
        "rgba(139, 199, 255, 0.8)", // Blue
        "rgba(139, 255, 158, 0.8)", // Green
        "rgba(171, 139, 255, 0.8)", // Back to purple
      ]
    );

    return {
      shadowColor: color,
      shadowOpacity: 0.8 + glowAnimation.value * 0.2,
      shadowRadius: 12 + glowAnimation.value * 8,
      borderColor: color,
    };
  });

  // Focus the input when on search page
  useEffect(() => {
    let focusTimeout: ReturnType<typeof setTimeout>;

    if (isSearchPage) {
      // Use a longer delay on iOS due to animation timing differences
      const delay = Platform.OS === "ios" ? 500 : 300;

      focusTimeout = setTimeout(() => {
        console.log("📱 Attempting to focus search input");
        if (inputRef.current) {
          inputRef.current.focus();
          console.log("✅ Focus applied to search input");
        } else {
          console.log("❌ Search input ref not available");
        }
      }, delay);
    }

    return () => {
      if (focusTimeout) clearTimeout(focusTimeout);
    };
  }, [isSearchPage]);

  const handlePress = () => {
    if (onPress) {
      // Use custom press handler if provided
      onPress();
    } else if (!isSearchPage) {
      // Make sure keyboard is dismissed when navigating
      Keyboard.dismiss();

      // Navigate to search page
      console.log("🔍 Navigating to search page");
      router.push("/(tabs)/search");
    }
  };

  const handleClear = () => {
    console.log("🧹 Clearing search input");
    if (onChangeText) {
      onChangeText("");
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Common styled container with tab bar matching appearance
  const containerStyle = {
    backgroundColor: "rgba(15, 13, 35, 0.85)",
    borderColor: "rgba(168, 181, 219, 0.2)",
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    height: 52,
  };

  if (isSearchPage) {
    // On search page - render editable input with clear button
    return (
      <Animated.View
        style={[containerStyle, styles.searchContainer, animatedGlowStyle]}
      >
        <Image
          source={icons.search}
          style={styles.searchIcon}
          resizeMode="contain"
          tintColor="#AB8BFF"
        />
        <TextInput
          ref={inputRef}
          placeholder={PLACEHOLDER_TEXT}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor="#A8B5DB"
          keyboardAppearance="dark"
          autoCorrect={false}
          spellCheck={false}
        />
        {value ? (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <View style={styles.clearButtonInner}>
              <Image
                source={icons.close}
                style={styles.clearIcon}
                resizeMode="contain"
                tintColor="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    );
  }

  // On other pages - render as button
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[containerStyle, styles.searchContainer, animatedGlowStyle]}
      >
        <Image
          source={icons.search}
          style={styles.searchIcon}
          resizeMode="contain"
          tintColor="#AB8BFF"
        />
        <TextInput
          placeholder={PLACEHOLDER_TEXT}
          style={styles.input}
          placeholderTextColor="#A8B5DB"
          editable={false}
          pointerEvents="none"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: "white",
    fontSize: 12, // Smaller font size to fit placeholder
  },
  clearButton: {
    padding: 6,
    marginRight: -8,
  },
  clearButtonInner: {
    backgroundColor: "rgba(171, 139, 255, 0.3)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  clearIcon: {
    width: 14,
    height: 14,
  },
});

export default SearchBar;
