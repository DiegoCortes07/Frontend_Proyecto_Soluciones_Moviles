import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Song from "../../../interfaces/Song";

const defaultSongImage = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";

interface SongCardProps {
  song: Song;
  onPress: () => void;
  onArtistPress?: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onAddToPlaylist: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  onPress,
  onArtistPress,
  isFavorited,
  onToggleFavorite,
  onAddToPlaylist,
}) => {
  const getSongImage = () => song?.imageUrl || (song as any)?.image || defaultSongImage;

  return (
    <View style={styles.songItem}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{ uri: getSongImage() }}
          style={styles.songImage}
          resizeMode="cover"
        />
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        {onArtistPress && (
          <TouchableOpacity onPress={onArtistPress} activeOpacity={0.7}>
            <Text style={styles.artistLink} numberOfLines={1}>
              {song.artistName}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <View style={styles.songItemActions}>
        <TouchableOpacity onPress={onToggleFavorite} style={styles.songActionButton}>
          <Icon
            name={isFavorited ? "heart" : "heart-o"}
            size={16}
            color={isFavorited ? "#ff4d4d" : "#9fb4d6"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAddToPlaylist} style={styles.songActionButton}>
          <Icon name="plus" size={16} color="#9fb4d6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  songItem: {
    marginRight: 10,
    backgroundColor: "#0f1d38",
    borderRadius: 14,
    width: 150,
    alignItems: "center",
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1c2f55",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    overflow: "hidden",
  },
  songImage: {
    width: "100%",
    maxWidth: 130,
    height: 110,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#1c2f55",
  },
  songTitle: {
    color: "#f7fbff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    width: "100%",
    maxWidth: 130,
    paddingHorizontal: 4,
  },
  songItemActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 12,
  },
  songActionButton: {
    padding: 6,
  },
  artistLink: {
    color: "#7fe9b5",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    width: "100%",
    maxWidth: 130,
    paddingHorizontal: 4,
  },
});
