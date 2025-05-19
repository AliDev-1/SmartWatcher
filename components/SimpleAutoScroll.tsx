import React, { useRef, useEffect } from "react";
import { ScrollView, Animated, Dimensions, View } from "react-native";

interface SimpleAutoScrollProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  style?: any;
}

const SimpleAutoScroll: React.FC<SimpleAutoScrollProps> = ({
  children,
  speed = 0.5,
  direction = "left",
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollAnim = useRef<Animated.CompositeAnimation | null>(null);
  const contentWidth = useRef(0);
  const screenWidth = Dimensions.get("window").width;

  // This will run when the component mounts and contentWidth changes
  useEffect(() => {
    // Need a small delay to get proper content width
    const timeout = setTimeout(() => {
      if (scrollViewRef.current && contentWidth.current > 0) {
        startScrolling();
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (scrollAnim.current) {
        scrollAnim.current.stop();
      }
    };
  }, [contentWidth.current]);

  // Start the infinite scrolling
  const startScrolling = () => {
    if (scrollAnim.current) {
      scrollAnim.current.stop();
    }

    // Start position based on direction
    const fromValue = direction === "right" ? contentWidth.current : 0;
    const toValue = direction === "right" ? 0 : contentWidth.current;

    scrollX.setValue(fromValue);

    // Set up the duration based on content size and speed
    const duration = (contentWidth.current / speed) * 20;

    // Create the animation
    scrollAnim.current = Animated.loop(
      Animated.timing(scrollX, {
        toValue: toValue,
        duration: duration,
        useNativeDriver: true,
        isInteraction: false,
      })
    );

    // Start the animation
    scrollAnim.current.start();
  };

  // Store content width when it changes
  const onContentSizeChange = (width: number) => {
    if (width !== contentWidth.current) {
      contentWidth.current = width;
      startScrolling();
    }
  };

  // Handle user interaction
  const onTouchStart = () => {
    if (scrollAnim.current) {
      scrollAnim.current.stop();
    }
  };

  const onTouchEnd = () => {
    // Resume animation after user interaction
    startScrolling();
  };

  return (
    <View style={[{ overflow: "hidden" }, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onContentSizeChange={(width) => onContentSizeChange(width)}
      >
        <Animated.View
          style={{
            flexDirection: "row",
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, contentWidth.current],
                  outputRange: [0, -contentWidth.current],
                }),
              },
            ],
          }}
        >
          {children}
          {children}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default SimpleAutoScroll;
