import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

import { icons } from "@/constants/icons";

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  overview: string;
  first_air_date: string;
}

const AiringTodayCard = ({ tvShow }: { tvShow: TVShow }) => {
  return (
    <Link href={`/tv/${tvShow.id}`} asChild>
      <TouchableOpacity className="w-64 h-full rounded-xl overflow-hidden">
        <Image
          source={{
            uri: tvShow.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${tvShow.backdrop_path}`
              : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          className="absolute w-full h-full rounded-xl"
          resizeMode="cover"
        />

        <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-3">
          <Text className="text-white text-base font-bold" numberOfLines={1}>
            {tvShow.name}
          </Text>

          <View className="flex-row items-center mt-1.5 justify-between">
            <View className="flex-row items-center gap-x-1">
              <Image source={icons.star} className="size-4" />
              <Text className="text-white font-bold">
                {Math.round(tvShow.vote_average / 2)}/5
              </Text>
            </View>

            <Text className="text-white text-xs">
              {tvShow.first_air_date?.split("-")[0]}
            </Text>
          </View>

          <Text className="text-white text-xs mt-2" numberOfLines={2}>
            {tvShow.overview}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default AiringTodayCard;
