import { View, Text, Image, Animated } from "react-native";
import React, { useRef, useEffect } from "react";
import { Tabs, useNavigation } from "expo-router";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { NavigationProp } from "@react-navigation/native";

// Define types for the tab icon props
type TabIconProps = {
  focused: boolean;
  icon: any;
  title: string;
};

// Function to render the tab icon - simplified for better performance
function TabIcon({ focused, icon, title }: TabIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      // Simpler animation
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Simpler animation
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [focused, opacityAnim]);

  return (
    <View className="size-full justify-center items-center">
      {/* Background highlight with animation */}
      <Animated.View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: opacityAnim,
        }}
      >
        <Image
          source={images.highlight}
          className="w-full h-full rounded-full"
          resizeMode="cover"
        />
      </Animated.View>

      {/* Tab icon only */}
      <Image
        source={icon}
        tintColor={focused ? "#151312" : "#A8B5DB"}
        className="size-5"
        resizeMode="contain"
      />
    </View>
  );
}

const Layout = () => {
  // Reference to hold active tab name
  const activeTabRef = useRef("");
  const navigation = useNavigation() as any;

  // Function to handle tab press - Scrolls to top if already on selected tab
  const handleTabPress = (route: string) => {
    if (activeTabRef.current === route) {
      // Get the current screen and scroll to top
      const currentScreen = navigation
        .getState()
        ?.routes.find((r: any) => r.name === route);

      if (
        currentScreen &&
        currentScreen.state &&
        currentScreen.state.index === 0
      ) {
        // Scroll to top logic - using event emission to be caught by the page
        navigation.emit({
          type: "tabPress",
          target: currentScreen.key,
          canPreventDefault: true,
          data: { scrollToTop: true },
        });
      }
    }

    // Update the active tab reference
    activeTabRef.current = route;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 0,
        },
        tabBarStyle: {
          backgroundColor: "rgba(15, 13, 35, 0.5)",
          backdropFilter: "blur(10px)",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(168, 181, 219, 0.2)",
          alignItems: "center",
          paddingVertical: 0,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#A8B5DB",
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Movies",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={icons.movie || icons.home}
              title="Movies"
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("index"),
        }}
      />
      <Tabs.Screen
        name="tv"
        options={{
          title: "TV Shows",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={icons.tv || icons.search}
              title="TV"
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("tv"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("profile"),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("search"),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Saved" />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("saved"),
        }}
      />
    </Tabs>
  );
};

export default Layout;
