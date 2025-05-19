import React from "react";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import randomColor from "randomcolor";
import { useMemo } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

type AnimatedBackgroundProps = {
  count?: number;
  hue?: string;
  intensity?: number;
  colors?: string[];
  duration?: number;
};

type Circle = {
  x: number;
  y: number;
  radius: number;
  index: number;
  color: string;
  delay: number;
  direction: number; // 1 or -1 for clockwise/counterclockwise
  speed: number; // Animation speed multiplier
};

type CircleProps = {
  circle: Circle;
  duration?: number;
  withBlur?: boolean;
};

function AnimatedCircle({ circle, duration = 10000, withBlur }: CircleProps) {
  // Adjust duration based on circle's speed factor
  const actualDuration = duration * (1 / circle.speed);

  // Calculate starting position for animation
  const startPosition = Math.random() * 360;

  // Create animation for rotation
  const rotation = useDerivedValue(() => {
    return withRepeat(
      withDelay(
        circle.delay,
        withTiming(startPosition + 360 * circle.direction, {
          duration: actualDuration,
          easing: Easing.linear,
        })
      ),
      -1, // infinite repeats
      false // no reverse
    );
  }, [actualDuration, circle.delay]);

  // Create animation style
  const stylez = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        stylez,
        {
          position: "absolute",
          width: circle.radius * 2,
          height: circle.radius * 2,
          left: circle.x - circle.radius,
          top: circle.y - circle.radius,
          transformOrigin: "center",
        },
      ]}
    >
      <View
        style={[
          {
            backgroundColor: circle.color,
            width: circle.radius * 2,
            height: circle.radius * 2,
            borderRadius: circle.radius,
            filter: Platform.OS === "android" ? "blur(5px)" : "",
            opacity: 0.7 + Math.random() * 0.3, // Varied opacity between 0.7-1.0
          },
        ]}
      />
      {withBlur && Platform.OS === "ios" && (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          intensity={3}
          tint="dark"
        />
      )}
    </Animated.View>
  );
}

export default function AnimatedBackground({
  count = 7,
  hue = "blue",
  intensity = 40,
  colors,
  duration = 30000,
}: AnimatedBackgroundProps) {
  const { width, height } = useWindowDimensions();

  // Create circles with more varied properties
  const circles = useMemo<Circle[]>(() => {
    const _colors =
      colors ??
      randomColor({
        count,
        hue,
        format: "rgba",
        luminosity: "light",
        alpha: 0.8,
      });

    // Create grid positions to ensure better distribution
    const positions = [];
    const gridSize = Math.ceil(Math.sqrt(count));
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (positions.length < count) {
          // Add some randomness within each grid cell
          const cellX = i * cellWidth + Math.random() * cellWidth * 0.8;
          const cellY = j * cellHeight + Math.random() * cellHeight * 0.8;
          positions.push({ x: cellX, y: cellY });
        }
      }
    }

    // Shuffle positions for more randomness
    positions.sort(() => Math.random() - 0.5);

    return _colors.map((color: string, index: number) => {
      // More varied circle sizes
      const sizeVariation = randomNumber(5, 14) / 10;
      const radius = (width * sizeVariation) / 2.5;

      // Get position from our distributed grid
      const pos = positions[index % positions.length];

      return {
        x: pos.x,
        y: pos.y,
        radius,
        index,
        color,
        delay: index * 700, // Stagger the animations more
        direction: Math.random() > 0.5 ? 1 : -1, // Random direction
        speed: 0.5 + Math.random() * 1.0, // Random speed between 0.5-1.5x
      };
    });
  }, [count, hue, colors, width, height]);

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      {circles.map((circle) => {
        return (
          <AnimatedCircle
            key={`circle-${circle.color}-${circle.index}`}
            circle={circle}
            duration={duration}
            withBlur={intensity !== 0}
          />
        );
      })}
      {intensity > 0 && (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          intensity={intensity}
          tint="dark"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F0D23",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
