import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import useFetch from "@/services/useFetch";
import {
  fetchPersonDetails,
  fetchPersonMovieCredits,
  fetchPersonTVCredits,
  fetchPersonImages,
} from "@/services/api";
import AnimatedBackground from "@/components/AnimatedBackground";

const { width, height } = Dimensions.get("screen");

// Theme colors based on app's tailwind config
const colors = {
  primary: "#030014",
  secondary: "#151312",
  header: "#151312",
  headerText: "#ffffff",
  tab: "#221F3D",
  tabText: "#9CA4AB",
  accent: "#AB8BFF",
  text: "#9CA4AB",
  white: "#ffffff",
  muted: "#9CA4AB",
};

const _headerHeight = height * 0.4; // Smaller header for person
const _headerHeightShrink = height * 0.15;
const _tabsHeight = 50;
const _tabsHeightShrink = _tabsHeight;

const inputRange = [0, _headerHeightShrink];

// Tabs Component
const tabs = ["Details", "Filmography", "Images"];

const Tabs = ({ scrollY, activeTab, setActiveTab }) => {
  const stylez = useAnimatedStyle(() => {
    return {
      height: _tabsHeight,
      marginTop: interpolate(
        scrollY.value,
        inputRange,
        [0, -_tabsHeightShrink / 2],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.tab,
        },
        stylez,
      ]}
      className="px-2"
    >
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 5 }}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(index)}
            className="px-4 py-3"
          >
            <Text
              style={{
                color: activeTab === index ? colors.accent : colors.tabText,
                fontWeight: activeTab === index ? "700" : "500",
              }}
              className="text-base"
            >
              {tab}
            </Text>

            {activeTab === index && (
              <View
                className="mt-1 h-0.5"
                style={{ backgroundColor: colors.accent, width: "100%" }}
              />
            )}
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
};

// Header Component
const Header = ({ scrollY, person }) => {
  const router = useRouter();

  const stylez = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        inputRange,
        [_headerHeight, _headerHeightShrink],
        Extrapolation.CLAMP
      ),
    };
  });

  const headerTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        inputRange,
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            inputRange,
            [0, -_headerHeight],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Get gender text
  const getGenderText = (gender) => {
    switch (gender) {
      case 1:
        return "Female";
      case 2:
        return "Male";
      default:
        return "Not specified";
    }
  };

  const profilePath = person?.profile_path
    ? `https://image.tmdb.org/t/p/original${person.profile_path}`
    : "https://via.placeholder.com/500x750/151312/9CA4AB?text=No+Image";

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.header,
          justifyContent: "flex-end",
        },
        stylez,
      ]}
      className="items-center"
    >
      <LinearGradient
        colors={["transparent", colors.primary]}
        style={StyleSheet.absoluteFillObject}
        className="z-10"
      />

      <TouchableOpacity
        className="absolute top-12 left-5 z-20 bg-black/50 rounded-full p-2"
        onPress={router.back}
      >
        <Feather name="chevron-left" size={24} color={colors.white} />
      </TouchableOpacity>

      <Image
        source={{ uri: profilePath }}
        className="h-full w-72 z-0"
        resizeMode="contain"
      />

      <Animated.View
        style={headerTextStyle}
        className="absolute bottom-0 w-full bg-gradient-to-t from-primary via-primary/90 to-transparent py-4 px-5 z-20"
      >
        <Text className="text-white font-bold text-3xl" numberOfLines={2}>
          {person?.name || "Loading..."}
        </Text>

        {person?.known_for_department && (
          <Text className="text-muted text-base mt-1">
            {person.known_for_department} • {getGenderText(person?.gender)}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
};

// Credit Card Component for filmography
const CreditCard = ({ credit, type }) => {
  const router = useRouter();

  const navigateToDetails = () => {
    if (type === "movie") {
      router.push(`/movie/${credit.id}`);
    } else {
      router.push(`/tv/${credit.id}`);
    }
  };

  const posterUrl = credit.poster_path
    ? `https://image.tmdb.org/t/p/w185${credit.poster_path}`
    : "https://via.placeholder.com/185x278/151312/9CA4AB?text=No+Image";

  const title = type === "movie" ? credit.title : credit.name;
  const releaseDate =
    type === "movie" ? credit.release_date : credit.first_air_date;
  const year = releaseDate ? releaseDate.split("-")[0] : "N/A";
  const role = credit.character || credit.job || "Unknown";

  return (
    <TouchableOpacity
      className="flex-row mb-4 bg-secondary rounded-lg overflow-hidden"
      onPress={navigateToDetails}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: posterUrl }}
        className="w-16 h-24"
        resizeMode="cover"
      />
      <View className="p-3 flex-1 justify-between">
        <View>
          <Text className="text-white font-bold text-base" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-white text-sm">{year}</Text>
        </View>
        <Text className="text-white text-sm" numberOfLines={1}>
          {role}
          {type === "tv" &&
            credit.episode_count &&
            ` (${credit.episode_count} episode${
              credit.episode_count > 1 ? "s" : ""
            })`}
        </Text>
      </View>
      <View className="justify-center pr-3">
        <View className="bg-primary px-2 py-1 rounded">
          <Text className="text-white text-xs">
            {Math.round(credit.vote_average * 10) / 10}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Image Card Component
const ImageCard = ({ image }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = `https://image.tmdb.org/t/p/w500${image.file_path}`;

  return (
    <View
      className="relative m-1"
      style={{ width: width / 3 - 10, aspectRatio: image.aspect_ratio }}
    >
      {!imageLoaded && (
        <View className="absolute inset-0 items-center justify-center bg-secondary">
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      )}
      <Animated.Image
        source={{ uri: imageUrl }}
        className="h-full w-full rounded-md"
        resizeMode="cover"
        entering={FadeIn.duration(300)}
        onLoad={() => setImageLoaded(true)}
      />
    </View>
  );
};

const PersonDetails = () => {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const scrollY = useSharedValue(0);

  const { data: person, loading } = useFetch(() =>
    fetchPersonDetails(id as string)
  );

  const { data: movieCredits, loading: movieCreditsLoading } = useFetch(() =>
    fetchPersonMovieCredits(id as string)
  );

  const { data: tvCredits, loading: tvCreditsLoading } = useFetch(() =>
    fetchPersonTVCredits(id as string)
  );

  const { data: images, loading: imagesLoading } = useFetch(() =>
    fetchPersonImages(id as string)
  );

  const onScroll = useAnimatedScrollHandler((ev) => {
    scrollY.value = ev.contentOffset.y;
  });

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        className="items-center justify-center"
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate age
  const calculateAge = (birthday, deathday = null) => {
    if (!birthday) return null;

    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();

    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && endDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Sort movie and TV credits by popularity/vote count
  const sortedMovieCast = movieCredits?.cast
    ? [...movieCredits.cast]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 15)
    : [];

  const sortedMovieCrew = movieCredits?.crew
    ? [...movieCredits.crew]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 10)
    : [];

  const sortedTVCast = tvCredits?.cast
    ? [...tvCredits.cast]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 15)
    : [];

  const sortedTVCrew = tvCredits?.crew
    ? [...tvCredits.crew]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 10)
    : [];

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <AnimatedBackground
        count={7}
        hue="blue"
        intensity={40}
        duration={30000}
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: 80,
          paddingTop: _headerHeight + _tabsHeight,
        }}
        className="z-0"
      >
        {activeTab === 0 && person && (
          // Details Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            <View className="mb-6">
              <Text className="text-white font-bold text-lg mb-1">
                Personal Info
              </Text>

              <View className="flex-row flex-wrap">
                <View className="w-1/2 pr-2 mb-4">
                  <Text className="text-muted text-sm">Born</Text>
                  <Text className="text-white text-sm mt-1">
                    {formatDate(person?.birthday)}
                    {person?.birthday && (
                      <Text className="text-muted">
                        {" "}
                        ({calculateAge(person.birthday, person?.deathday)} years
                        old)
                      </Text>
                    )}
                  </Text>
                </View>

                {person?.deathday && (
                  <View className="w-1/2 pl-2 mb-4">
                    <Text className="text-muted text-sm">Died</Text>
                    <Text className="text-white text-sm mt-1">
                      {formatDate(person.deathday)}
                    </Text>
                  </View>
                )}

                {person?.place_of_birth && (
                  <View className="w-full mb-4">
                    <Text className="text-muted text-sm">Place of Birth</Text>
                    <Text className="text-white text-sm mt-1">
                      {person.place_of_birth}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {person?.also_known_as && person.also_known_as.length > 0 && (
              <View className="mb-6">
                <Text className="text-white font-bold text-lg mb-1">
                  Also Known As
                </Text>
                {person.also_known_as.map((name, index) => (
                  <Text key={index} className="text-white text-sm">
                    {name}
                  </Text>
                ))}
              </View>
            )}

            <View className="mb-6">
              <Text className="text-white font-bold text-lg mb-3">
                Biography
              </Text>
              {!person?.biography ? (
                <Text className="text-muted text-base italic">
                  No biography available.
                </Text>
              ) : (
                <Text className="text-white text-base leading-6">
                  {person.biography}
                </Text>
              )}
            </View>

            {person?.homepage && (
              <TouchableOpacity
                className="bg-secondary py-3 px-4 rounded-lg flex-row items-center justify-center mb-6"
                onPress={() =>
                  person.homepage && Linking.openURL(person.homepage)
                }
              >
                <Feather name="external-link" size={16} color={colors.accent} />
                <Text className="text-accent text-base ml-2">
                  Official Website
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeTab === 1 && (
          // Filmography Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            {movieCreditsLoading || tvCreditsLoading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : (
              <>
                {sortedMovieCast.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-bold text-xl mb-4">
                      Movies (Acting)
                    </Text>
                    {sortedMovieCast.map((credit) => (
                      <CreditCard
                        key={`movie-cast-${credit.id}`}
                        credit={credit}
                        type="movie"
                      />
                    ))}
                  </View>
                )}

                {sortedTVCast.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-bold text-xl mb-4">
                      TV Shows (Acting)
                    </Text>
                    {sortedTVCast.map((credit) => (
                      <CreditCard
                        key={`tv-cast-${credit.id}`}
                        credit={credit}
                        type="tv"
                      />
                    ))}
                  </View>
                )}

                {sortedMovieCrew.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-bold text-xl mb-4">
                      Movies (Production)
                    </Text>
                    {sortedMovieCrew.map((credit) => (
                      <CreditCard
                        key={`movie-crew-${credit.id}`}
                        credit={credit}
                        type="movie"
                      />
                    ))}
                  </View>
                )}

                {sortedTVCrew.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-bold text-xl mb-4">
                      TV Shows (Production)
                    </Text>
                    {sortedTVCrew.map((credit) => (
                      <CreditCard
                        key={`tv-crew-${credit.id}`}
                        credit={credit}
                        type="tv"
                      />
                    ))}
                  </View>
                )}

                {sortedMovieCast.length === 0 &&
                  sortedTVCast.length === 0 &&
                  sortedMovieCrew.length === 0 &&
                  sortedTVCrew.length === 0 && (
                    <View className="items-center justify-center py-10">
                      <Feather name="film" size={48} color={colors.accent} />
                      <Text className="text-muted text-base mt-3 text-center">
                        No filmography available
                      </Text>
                    </View>
                  )}
              </>
            )}
          </View>
        )}

        {activeTab === 2 && (
          // Images Tab
          <View className="px-5 py-4 bg-primary/90 rounded-lg mx-2 my-1">
            {imagesLoading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : !images?.profiles || images.profiles.length === 0 ? (
              <View className="items-center justify-center py-10">
                <Feather name="image" size={48} color={colors.accent} />
                <Text className="text-muted text-base mt-3 text-center">
                  No images available
                </Text>
              </View>
            ) : (
              <>
                <Text className="text-white font-bold text-xl mb-4">
                  Photos ({images.profiles.length})
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {images.profiles.map((image, index) => (
                    <ImageCard key={`image-${index}`} image={image} />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </Animated.ScrollView>

      <View style={{ position: "absolute", width: "100%" }}>
        <Header scrollY={scrollY} person={person} />
        <Tabs
          scrollY={scrollY}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </View>
    </View>
  );
};

export default PersonDetails;

const styles = StyleSheet.create({});
