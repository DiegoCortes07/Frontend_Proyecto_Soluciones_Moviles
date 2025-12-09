import React from "react";
import { Text, StyleSheet, Image, TouchableOpacity, View } from "react-native";
import Playlist from "../../../../interfaces/Playlist";

interface PlaylistCardProps {
  playlist: Playlist;
  coverImage: string;
  onPress: () => void;
  cantSongs: number;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  coverImage,
  onPress,
  cantSongs,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              coverImage ||
              "https://cdn-icons-png.flaticon.com/512/11065/11065753.png",
          }}
          style={styles.image}
        />
        <View style={styles.songBadge}>
          <Text style={styles.songBadgeText}>
            {cantSongs === 1 ? "1 canción" : `${cantSongs} canciones`}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {playlist.name}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {playlist.description?.trim() || "Sin descripción"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    alignItems: "flex-start",
    backgroundColor: "#0c1730",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1a2f57",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    gap: 6,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#142443",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  songBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(3, 169, 244, 0.85)",
  },
  songBadgeText: {
    color: "#f7fbff",
    fontSize: 11,
    fontWeight: "800",
  },
  cardTitle: {
    color: "#f7fbff",
    marginTop: 2,
    textAlign: "left",
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 18,
  },
  cardDescription: {
    color: "#9fb4d6",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "left",
  },
});
