import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface NowPlayingCardProps {
  movie: Movie;
}

const NowPlayingCard = ({ movie }: NowPlayingCardProps) => {
  return (
    <Link href={`/movie/${movie.id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <View style={styles.card}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
            style={styles.overlay}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {movie.title}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>
                  ⭐ {movie.vote_average.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.date}>In Theaters Now</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 300,
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
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: 12,
  },
  infoContainer: {
    gap: 4,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    color: "#FFC107",
    fontSize: 14,
    marginRight: 8,
  },
  date: {
    color: "#e6e6e6",
    fontSize: 12,
  },
});

export default NowPlayingCard;
