import { Stack } from "expo-router/stack";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function AuthLayout() {
  return (
    <>
      <AnimatedBackground
        count={7}
        hue="blue"
        intensity={40}
        duration={30000}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </>
  );
}
