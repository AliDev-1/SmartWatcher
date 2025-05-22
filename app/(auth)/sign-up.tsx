import React, { useState } from "react";
import { useOAuth, useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  // Warm up browser for OAuth
  useWarmUpBrowser();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
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
      console.error(`Error signing up with ${provider}:`, err);
      setError(`Failed to sign up with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded || loading) return;

    try {
      setLoading(true);
      setError("");

      // Start sign-up process using email and password provided
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display verification form
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.message || "Failed to sign up. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded || loading) return;

    try {
      setLoading(true);
      setError("");

      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        // If the status is not complete, check why
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError("Verification could not be completed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.message || "Failed to verify. Please try again."
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
          {pendingVerification ? (
            <>
              <Text className="text-white text-4xl font-bold mb-8 text-center">
                Verify Email
              </Text>

              {error ? (
                <Text className="text-red-500 mb-4 text-center">{error}</Text>
              ) : null}

              <Text className="text-white mb-6 text-center">
                We've sent a verification code to {emailAddress}
              </Text>

              <View className="mb-8">
                <Text className="text-white text-base mb-2">
                  Verification Code
                </Text>
                <TextInput
                  value={code}
                  placeholder="Enter your verification code"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  onChangeText={(code) => setCode(code)}
                  className="bg-white/10 p-4 rounded-xl text-white"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                onPress={onVerifyPress}
                disabled={loading || !code}
                className={`py-4 rounded-xl items-center ${
                  loading || !code ? "bg-gray-500" : "bg-purple-700"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Verify
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white text-4xl font-bold mb-8 text-center">
                Create Account
              </Text>

              {error ? (
                <Text className="text-red-500 mb-4 text-center">{error}</Text>
              ) : null}

              {/* Social Sign Up Options */}
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
                  placeholder="Create a password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry={true}
                  onChangeText={(password) => setPassword(password)}
                  className="bg-white/10 p-4 rounded-xl text-white"
                />
              </View>

              <TouchableOpacity
                onPress={onSignUpPress}
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
                  <Text className="text-white font-semibold text-lg">
                    Sign Up
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6">
                <Text className="text-white">Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity className="ml-2">
                    <Text className="text-purple-400 font-semibold">
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
