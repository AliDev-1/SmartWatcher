import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

import { icons } from "@/constants/icons";

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
}

const PopularTVCard = ({
  tvShow,
  index,
}: {
  tvShow: TVShow;
  index: number;
}) => {
  return (
    <Link href={`/tv/${tvShow.id}`} asChild>
      <TouchableOpacity className="rounded-xl w-32 relative">
        <View className="absolute top-1 left-1 z-10 bg-black/70 w-6 h-6 rounded-full items-center justify-center">
          <Text className="text-white font-bold text-xs">{index + 1}</Text>
        </View>

        <Image
          source={{
            uri: tvShow.poster_path
              ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
              : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          className="w-32 h-44 rounded-xl"
          resizeMode="cover"
        />

        <View className="p-1">
          <Text className="text-white text-xs font-bold mt-1" numberOfLines={2}>
            {tvShow.name}
          </Text>

          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center gap-x-1">
              <Image source={icons.star} className="size-3" />
              <Text className="text-white text-xs font-bold">
                {Math.round(tvShow.vote_average / 2)}
              </Text>
            </View>

            <Text className="text-xs text-gray-400">
              {tvShow.first_air_date?.split("-")[0]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default PopularTVCard;
