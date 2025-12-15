import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Song from "../../../../interfaces/Song";
import { useTheme } from "../../../../contexts/ThemeContext";

// Declarar window para TypeScript en web
declare const window: any;

interface PlaylistSongRowProps {
  song: Song;
  isFavorited: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  onAddToPlaylist: () => void;
  onRemoveFromPlaylist: () => void;
}

export const PlaylistSongRow: React.FC<PlaylistSongRowProps> = ({
  song,
  isFavorited,
  onPress,
  onToggleFavorite,
  onAddToPlaylist,
  onRemoveFromPlaylist,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const defaultSongImage =
    "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";
  const getSongImage = (s: Song) =>
    s?.imageUrl || (s as any)?.image || defaultSongImage;

  const handleRemove = (e: any) => {
    e?.stopPropagation?.();
    console.log("PlaylistSongRow: handleRemove called for song:", song.title);

    if (Platform.OS === "web") {
      if (window.confirm(`¿Eliminar "${song.title}" de la playlist?`)) {
        console.log(
          "PlaylistSongRow: User confirmed delete, calling onRemoveFromPlaylist"
        );
        onRemoveFromPlaylist();
      } else {
        console.log("PlaylistSongRow: User cancelled delete");
      }
    } else {
      Alert.alert(
        "Eliminar canción",
        "¿Eliminar esta canción de la playlist?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              console.log(
                "PlaylistSongRow: Confirmed delete, calling onRemoveFromPlaylist"
              );
              onRemoveFromPlaylist();
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.songRow}>
      <TouchableOpacity style={styles.songRowMain} onPress={onPress}>
        <Image
          source={{ uri: getSongImage(song) }}
          style={styles.songImage}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {song.title}
          </Text>
          {song.artistName ? (
            <Text style={styles.songSubtitle} numberOfLines={1}>
              {song.artistName}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <View style={styles.songRowActions}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Icon
            name={isFavorited ? "heart" : "heart-o"}
            size={18}
            color={isFavorited ? theme.liked : theme.textTertiary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onAddToPlaylist();
          }}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Icon name="plus" size={18} color={theme.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRemove}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Icon name="trash" size={16} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    songRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    songRowMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    songRowActions: {
      flexDirection: "row",
      gap: 8,
      marginLeft: 8,
    },
    songImage: {
      width: 56,
      height: 56,
      borderRadius: 10,
      marginRight: 12,
    },
    songTitle: {
      color: theme.textPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    songSubtitle: {
      color: theme.textTertiary,
      marginTop: 2,
    },
    actionButton: {
      padding: 6,
    },
  });
