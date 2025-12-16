import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Podcast from "../../../interfaces/Podcast";
import { useTheme } from "../../../contexts/ThemeContext";
import Artist from "../../../interfaces/Artist";
import { getSongImageUrl, logImageError } from "../../../utils/imageHelper";

const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

interface PodcastCardProps {
  podcast: Podcast;
  artist?: Artist | null;
  onPodcastPress: () => void;
  onArtistPress?: () => void;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  artist,
  onPodcastPress,
  onArtistPress,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const getPodcastImage = () => getSongImageUrl(podcast?.image || (podcast as any)?.imageUrl);
  const getArtistImage = () => artist?.image || defaultAvatar;

  return (
    <View style={styles.podcastItem}>
      <TouchableOpacity onPress={onPodcastPress}>
        <Image
          source={{ uri: getPodcastImage() }}
          style={styles.podcastImage}
          resizeMode="cover"
          onError={() => logImageError("PodcastCard", getPodcastImage())}
          progressiveRenderingEnabled={true}
        />
      </TouchableOpacity>
      <Text style={styles.podcastTitle} numberOfLines={2}>
        {podcast.title}
      </Text>
      {podcast.genre && (
        <View style={styles.podcastMetadata}>
          <Text style={styles.podcastMeta} numberOfLines={1}>
            {podcast.genre}
          </Text>
          {podcast.year && (
            <>
              <Text style={styles.podcastMeta}>•</Text>
              <Text style={styles.podcastMeta} numberOfLines={1}>
                {podcast.year}
              </Text>
            </>
          )}
        </View>
      )}
      {onArtistPress && podcast.artistName && (
        <TouchableOpacity onPress={onArtistPress} activeOpacity={0.8}>
          <View style={styles.podcastArtistRow}>
            {artist && (
              <Image
                source={{ uri: getArtistImage() }}
                style={styles.podcastArtistImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.artistLink} numberOfLines={1}>
              {podcast.artistName}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  podcastItem: {
    marginRight: 20,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: theme.backgroundCard,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    width: 160,
  },
  podcastImage: {
    width: 140,
    height: 140,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#9B4DCA",
  },
  podcastTitle: {
    color: theme.textPrimary,
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    minHeight: 40,
  },
  podcastMetadata: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    gap: 4,
  },
  podcastMeta: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    maxWidth: 60,
  },
  podcastArtistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  podcastArtistImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  artistLink: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
    maxWidth: 100,
  },
});
