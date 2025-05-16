import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  Dimensions,
  ScrollView,
  PanResponder,
} from "react-native";

interface AutoScrollListProps<T> {
  data: T[];
  renderItem: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  scrollDuration?: number;
  reverse?: boolean;
  containerStyle?: object;
  itemWidth: number;
}

function AutoScrollList<T>({
  data,
  renderItem,
  keyExtractor,
  scrollDuration = 50000,
  reverse = false,
  containerStyle,
  itemWidth,
}: AutoScrollListProps<T>) {
  const scrollViewRef = useRef<ScrollView>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const { width: screenWidth } = Dimensions.get("window");

  // Create a triple dataset for smooth looping
  const repeatedData = React.useMemo(() => {
    return [...data, ...data, ...data];
  }, [data]);

  // Calculate total width for a single set
  const singleSetWidth = data.length * itemWidth;

  // Setup pan responder for manual interaction
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Stop the animation when user starts touching
        if (animationRef.current) {
          animationRef.current.stop();
        }
        setIsManualScrolling(true);
      },
      onPanResponderRelease: () => {
        // Resume animation when user stops touching
        setIsManualScrolling(false);
        startAnimation();
      },
    })
  ).current;

  // Start the animation
  const startAnimation = () => {
    if (isManualScrolling || data.length === 0) return;

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // Set the initial position
    const initialValue = reverse ? singleSetWidth : 0;
    scrollX.setValue(initialValue);

    // Create a new animation
    const animationConfig = {
      toValue: reverse ? 0 : singleSetWidth,
      duration: scrollDuration,
      useNativeDriver: true,
    };

    // Start the loop animation
    animationRef.current = Animated.loop(
      Animated.timing(scrollX, animationConfig)
    );

    animationRef.current.start();
  };

  useEffect(() => {
    // Delay start of animation to allow rendering
    const timer = setTimeout(() => {
      startAnimation();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [data, reverse, scrollDuration, itemWidth]);

  // If no data, don't render anything
  if (data.length === 0) return null;

  // Calculate the transform based on scroll position
  const transformValue = isManualScrolling
    ? 0
    : scrollX.interpolate({
        inputRange: [0, singleSetWidth],
        outputRange: [0, reverse ? singleSetWidth : -singleSetWidth],
      });

  return (
    <View style={{ overflow: "hidden" }} {...panResponder.panHandlers}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onScroll={(e) => {
          if (isManualScrolling) {
            setScrollOffset(e.nativeEvent.contentOffset.x);
            // Update animation value to match scroll position
            scrollX.setValue(e.nativeEvent.contentOffset.x % singleSetWidth);
          }
        }}
        scrollEventThrottle={16}
        style={{ flexGrow: 0 }}
        contentContainerStyle={containerStyle}
      >
        <Animated.View
          style={[
            { flexDirection: "row" },
            { transform: [{ translateX: transformValue }] },
          ]}
        >
          {repeatedData.map((item, index) => (
            <View
              key={`${keyExtractor(item, index % data.length)}-${index}`}
              style={{ width: itemWidth }}
            >
              {renderItem({ item, index: index % data.length })}
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

export default AutoScrollList;
