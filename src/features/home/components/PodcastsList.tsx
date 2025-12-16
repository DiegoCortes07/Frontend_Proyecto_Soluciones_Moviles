import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Podcast from "../../../interfaces/Podcast";
import Artist from "../../../interfaces/Artist";
import { PodcastCard } from "./PodcastCard";
import { useTheme } from "../../../contexts/ThemeContext";

interface PodcastsListProps {
  podcasts: Podcast[];
  loading?: boolean;
  artistCache: Record<number, Artist | null>;
  onPodcastPress: (podcastId: number) => void;
  onArtistPress?: (artistId?: number) => void;
}

export const PodcastsList: React.FC<PodcastsListProps> = ({
  podcasts,
  loading,
  artistCache,
  onPodcastPress,
  onArtistPress,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  
  if (!podcasts || podcasts.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Podcasts</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#9B4DCA" style={styles.loader} />
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList<Podcast>
            data={podcasts}
            renderItem={({ item }) => {
              const cachedArtist = item.artistId
                ? artistCache[item.artistId]
                : null;
              return (
                <PodcastCard
                  podcast={item}
                  artist={cachedArtist}
                  onPodcastPress={() => onPodcastPress(item.id)}
                  onArtistPress={
                    onArtistPress && item.artistId
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
