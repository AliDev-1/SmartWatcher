import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface UpcomingCardProps {
  movie: Movie;
}

const UpcomingCard = ({ movie }: UpcomingCardProps) => {
  // Format release date to "MMM DD, YYYY"
  const formatDate = (dateString: string) => {
    if (!dateString) return "Coming Soon";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/movie/${movie.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <View style={styles.card}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${
                movie.backdrop_path || movie.poster_path
              }`,
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)", "transparent"]}
            style={styles.topGradient}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
            style={styles.bottomGradient}
          />
          <View style={styles.comingSoonTag}>
            <Text style={styles.comingSoonText}>COMING SOON</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {movie.title}
            </Text>
            <Text style={styles.date}>
              Release: {formatDate(movie.release_date)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 270,
    height: 160,
    marginRight: 15,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  comingSoonTag: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 59, 48, 0.8)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  comingSoonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    color: "#e6e6e6",
    fontSize: 12,
  },
});

export default UpcomingCard;
