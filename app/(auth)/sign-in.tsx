import React, { useState } from "react";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  // Warm up browser for OAuth
  useWarmUpBrowser();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OAuth handlers
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  const { startOAuthFlow: discordAuth } = useOAuth({
    strategy: "oauth_discord",
  });

  const handleSocialAuth = async (
    authMethod: () => Promise<{
      createdSessionId: string | null;
      setActive: (params: { session: string }) => Promise<void>;
      signIn?: any;
      signUp?: any;
    }>,
    provider: string
  ) => {
    try {
      setLoading(true);
      const { createdSessionId, setActive: setOAuthActive } =
        await authMethod();

      if (createdSessionId) {
        // If successful, set the session as active and redirect
        await setOAuthActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error(`Error signing in with ${provider}:`, err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded || loading) return;

    try {
      setLoading(true);
      setError("");

      // Start the sign-in process using the email and password provided
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError("Sign in could not be completed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.message || "Failed to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-8"
      >
        <Animated.View
          entering={FadeIn.duration(1000)}
          className="bg-black/70 rounded-3xl p-8"
        >
          <Text className="text-white text-4xl font-bold mb-8 text-center">
            Welcome Back
          </Text>

          {error ? (
            <Text className="text-red-500 mb-4 text-center">{error}</Text>
          ) : null}

          {/* Social Sign In Options */}
          <View className="mb-8 gap-y-3">
            <TouchableOpacity
              onPress={() => handleSocialAuth(googleAuth, "Google")}
              disabled={loading}
              className="flex-row bg-white/10 py-3 px-4 rounded-xl items-center justify-center"
            >
              <Feather name="chrome" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialAuth(appleAuth, "Apple")}
              disabled={loading}
              className="flex-row bg-white/10 py-3 px-4 rounded-xl items-center justify-center"
            >
              <Feather name="command" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialAuth(discordAuth, "Discord")}
              disabled={loading}
              className="flex-row bg-white/10 py-3 px-4 rounded-xl items-center justify-center"
            >
              <Feather name="message-circle" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Continue with Discord
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="h-px flex-1 bg-white/20" />
            <Text className="text-white mx-3">or</Text>
            <View className="h-px flex-1 bg-white/20" />
          </View>

          <View className="mb-6">
            <Text className="text-white text-base mb-2">Email</Text>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              onChangeText={(email) => setEmailAddress(email)}
              className="bg-white/10 p-4 rounded-xl text-white"
            />
          </View>

          <View className="mb-8">
            <Text className="text-white text-base mb-2">Password</Text>
            <TextInput
              value={password}
              placeholder="Enter your password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
              className="bg-white/10 p-4 rounded-xl text-white"
            />
          </View>

          <TouchableOpacity
            onPress={onSignInPress}
            disabled={loading || !emailAddress || !password}
            className={`py-4 rounded-xl items-center ${
              loading || !emailAddress || !password
                ? "bg-gray-500"
                : "bg-purple-700"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-white">Don't have an account?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="ml-2">
                <Text className="text-purple-400 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
