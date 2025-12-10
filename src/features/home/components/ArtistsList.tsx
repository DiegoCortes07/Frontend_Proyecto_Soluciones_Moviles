import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Artist from "../../../interfaces/Artist";
import { ArtistCard } from "./ArtistCard";

interface ArtistsListProps {
  artists: { id?: number; name: string }[];
  artistCache: Record<number, Artist | null>;
  searchText: string;
  onArtistPress: (artistId?: number) => void;
  onArtistLongPress?: (artistName: string) => void;
}

export const ArtistsList: React.FC<ArtistsListProps> = ({
  artists,
  artistCache,
  searchText,
  onArtistPress,
  onArtistLongPress,
}) => {
  const q = (searchText || "").toLowerCase().trim();
  const filtered = q
    ? artists.filter((a) => a.name.toLowerCase().includes(q))
    : artists;

  return (
    <View>
      <Text style={styles.sectionTitle}>Artistas</Text>
      <View style={styles.flatListContainer}>
        <FlatList
          data={filtered}
          horizontal
          keyExtractor={(a) => a.name}
          renderItem={({ item }) => {
            const cached = item.id ? artistCache[item.id] : null;
            return (
              <ArtistCard
                artist={cached}
                artistName={item.name}
                onPress={() => onArtistPress(item.id)}
                onLongPress={
                  onArtistLongPress ? () => onArtistLongPress(item.name) : undefined
                }
              />
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#f4f8ff",
    fontSize: 26,
    fontWeight: "800",
    marginVertical: 12,
  },
  flatListContainer: {
    overflow: "hidden",
    marginBottom: 16,
  },
});
