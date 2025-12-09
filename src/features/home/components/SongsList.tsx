import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Song from "../../../interfaces/Song";
import { SongCard } from "./SongCard";

interface SongsListProps {
  title: string;
  songs: Song[];
  loading?: boolean;
  isFavorited: (songId: number) => boolean;
  onSongPress: (song: Song) => void;
  onArtistPress?: (artistId?: number) => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export const SongsList: React.FC<SongsListProps> = ({
  title,
  songs,
  loading,
  isFavorited,
  onSongPress,
  onArtistPress,
  onToggleFavorite,
  onAddToPlaylist,
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList<Song>
            data={songs}
            renderItem={({ item }) => (
              <SongCard
                song={item}
                onPress={() => onSongPress(item)}
                onArtistPress={
                  onArtistPress ? () => onArtistPress(item.artistId) : undefined
                }
                isFavorited={isFavorited(item.id)}
                onToggleFavorite={() => onToggleFavorite(item)}
                onAddToPlaylist={() => onAddToPlaylist(item)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
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
  loader: { marginVertical: 12 },
  flatListContainer: {
    overflow: "hidden",
    marginBottom: 16,
  },
});
