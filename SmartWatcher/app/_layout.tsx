import React from "react";
import { Stack } from "expo-router";
import "./globals.css";
import { StatusBar, View } from "react-native";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <AnimatedBackground
        count={7}
        hue="blue"
        intensity={40}
        duration={30000}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "transparent" },
          gestureEnabled: true,
          animationDuration: 300,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="movie/[id]"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="tv/[id]"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="person/[id]"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>
    </>
  );
}
