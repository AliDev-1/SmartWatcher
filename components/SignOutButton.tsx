import React from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface SignOutButtonProps {
  variant?: "text" | "button";
  buttonClassName?: string;
  textClassName?: string;
}

export default function SignOutButton({
  variant = "button",
  buttonClassName = "",
  textClassName = "",
}: SignOutButtonProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "text") {
    return (
      <TouchableOpacity onPress={handleSignOut} disabled={loading}>
        <Text className={`text-white font-medium ${textClassName}`}>
          {loading ? "Signing out..." : "Sign out"}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        onPress={handleSignOut}
        disabled={loading}
        className={`bg-purple-700 py-2 px-4 rounded-xl ${buttonClassName}`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className={`text-white font-medium ${textClassName}`}>
            Sign out
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
