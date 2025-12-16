import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Song from "../../../interfaces/Song";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  DEFAULT_SONG_IMAGE,
  getSongImageUrl,
  logImageError,
} from "../../../utils/imageHelper";

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
  const { theme } = useTheme();
  const auth = useAuth();
  const isPremium = auth.user?.plan === "premium";
  const styles = getStyles(theme);
  const getSongImage = () =>
    getSongImageUrl(song?.imageUrl || (song as any)?.image);
  const [imageUri, setImageUri] = React.useState<string>(getSongImage());

  const handleDownload = () => {
    console.log("Downloading song:", song.title);
    // Aquí se implementará la lógica de descarga
  };

  React.useEffect(() => {
    setImageUri(getSongImage());
  }, [song?.id]);

  return (
    <View style={styles.songItem}>
      <TouchableOpacity onPress={onPress} style={styles.touchableArea}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUri }}
            style={styles.songImage}
            resizeMode="cover"
            onError={() => {
              logImageError("SongCard", imageUri);
              setImageUri(DEFAULT_SONG_IMAGE);
            }}
            progressiveRenderingEnabled={true}
          />
        </View>
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
        <TouchableOpacity
          onPress={onToggleFavorite}
          style={styles.songActionButton}
        >
          <Icon
            name={isFavorited ? "heart" : "heart-o"}
            size={16}
            color={isFavorited ? "#ff4d4d" : "#9fb4d6"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAddToPlaylist}
          style={styles.songActionButton}
        >
          <Icon name="plus" size={16} color="#9fb4d6" />
        </TouchableOpacity>
        {isPremium && (
          <TouchableOpacity
            onPress={handleDownload}
            style={styles.songActionButton}
          >
            <Icon name="download" size={16} color="#1DB954" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  songItem: {
    marginRight: 10,
    backgroundColor: theme.backgroundCard,
    borderRadius: 14,
    width: 150,
    alignItems: "center",
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    overflow: "hidden",
  },
  touchableArea: {
    width: "100%",
    alignItems: "center",
  },
  imageWrapper: {
    width: 130,
    height: 130,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: theme.backgroundElevated,
    overflow: "hidden",
  },
  songImage: {
    width: "100%",
    height: "100%",
  },
  songTitle: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    width: "100%",
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
    color: theme.textTertiary,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 4,
  },
});
