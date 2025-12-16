import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Song from "../../../../interfaces/Song";
import { getSongImageUrl, logImageError } from "../../../../utils/imageHelper";

interface LikedSongCardProps {
  song: Song;
  isFavorited: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onAddToPlaylist: () => void;
}

export const LikedSongCard: React.FC<LikedSongCardProps> = ({
  song,
  isFavorited,
  onPress,
  onToggleFavorite,
  onAddToPlaylist,
}) => {
  const getSongImage = (s: Song) => getSongImageUrl(s?.imageUrl || (s as any)?.image);
  const artist = song.artistName?.trim() || "Artista desconocido";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: getSongImage(song) }} 
          style={styles.image} 
          resizeMode="cover"
          onError={() => logImageError("LikedSongCard", getSongImage(song))}
          progressiveRenderingEnabled={true}
        />
        <View style={styles.badge}>
          <Icon
            name={isFavorited ? "heart" : "heart-o"}
            size={12}
            color="#f7fbff"
          />
          <Text style={styles.badgeText}>{isFavorited ? "Favorita" : "Descubre"}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {song.title}
      </Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>
        {artist}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={onToggleFavorite}
          style={[styles.actionButton, isFavorited && styles.actionActive]}
          activeOpacity={0.8}
        >
          <Icon
            name={isFavorited ? "heart" : "heart-o"}
            size={18}
            color={isFavorited ? "#ff6b81" : "#9fb4d6"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAddToPlaylist}
          style={styles.actionButton}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={18} color="#9fb4d6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
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
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(52, 152, 219, 0.9)",
  },
  badgeText: {
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
  cardSubtitle: {
    color: "#9fb4d6",
    fontSize: 12,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#122341",
  },
  actionActive: {
    backgroundColor: "rgba(255, 107, 129, 0.15)",
  },
});
