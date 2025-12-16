import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Album from "../../../interfaces/Album";
import Artist from "../../../interfaces/Artist";
import { AlbumCard } from "./AlbumCard";
import { useTheme } from "../../../contexts/ThemeContext";

interface AlbumsListProps {
  albums: Album[];
  loading?: boolean;
  artistCache: Record<number, Artist | null>;
  onAlbumPress: (albumId: number) => void;
  onArtistPress?: (artistId?: number) => void;
}

export const AlbumsList: React.FC<AlbumsListProps> = ({
  albums,
  loading,
  artistCache,
  onAlbumPress,
  onArtistPress,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  return (
    <View>
      <Text style={styles.sectionTitle}>Álbumes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList<Album>
            data={albums}
            renderItem={({ item }) => {
              const cachedArtist = item.artistId
                ? artistCache[item.artistId]
                : null;
              return (
                <AlbumCard
                  album={item}
                  artist={cachedArtist}
                  onAlbumPress={() => onAlbumPress(item.id)}
                  onArtistPress={
                    onArtistPress
                      ? () => onArtistPress(item.artistId)
                      : undefined
                  }
                />
              );
            }}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: 26,
      fontWeight: "800",
      marginVertical: 12,
    },
    loader: { marginVertical: 12 },
    flatListContainer: {
      overflow: "hidden",
      marginBottom: 16,
    },
  });
