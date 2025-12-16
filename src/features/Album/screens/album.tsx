import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Album from "../../../interfaces/Album";
import Song from "../../../interfaces/Song";
import Podcast from "../../../interfaces/Podcast";
import { fetchSongsByAlbum, fetchAlbumDetails} from "../../../../api/album";
import { getAllPodcasts, getShowsForPodcastId } from "../../../../api/podcast";
import { useRoute, RouteProp } from "@react-navigation/native";
import { usePlayer } from "../../../contexts/PlayerContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import AppLayout from "../../../components/layout/AppLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
  albumId?: number | string;
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function AlbumScreen({ albumId }: Props) {
  const route = useRoute<RouteProp<Record<string, { id?: string }>, string>>();
  const paramId = route?.params?.id;
  const id = albumId ?? paramId;

  const [album, setAlbum] = useState<Album | Podcast | null>(null);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPodcast, setIsPodcast] = useState<boolean>(false);

  const player = usePlayer();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    if (!id) {
      setError("No se indicó id de álbum");
      setLoading(false);
      return;
    }

    const fetchAlbum = async () => {
      setLoading(true);
      setError(null);
      try {
        // Intentar primero como álbum
        let albumRes = await fetchAlbumDetails(id).catch(() => null);
        let res = await fetchSongsByAlbum(id).catch(() => null);
        
        // Si no es un álbum, intentar como podcast
        if (!albumRes || !res || res.length === 0) {
          const podcasts = await getAllPodcasts();
          const podcastList = Array.isArray(podcasts) ? podcasts : (podcasts as any)?.podcasts || [];
          const podcast = podcastList.find((p: any) => p.id === Number(id));
          
          if (podcast) {
            setIsPodcast(true);
            const episodes = await getShowsForPodcastId(id);
            const episodeList = Array.isArray(episodes) ? episodes : (episodes as any)?.episodes || [];
            setAlbum(podcast);
            setTracks(episodeList);
            return;
          }
        }

        if (albumRes) {
          setIsPodcast(false);
          setAlbum(albumRes);
          setTracks(res || []);
        } else {
          setTracks(res || []);
          setAlbum(albumRes);
        }
      } catch (e: any) {
        console.error("Error fetching album/podcast:", e);
        setError(e?.message || "Error al cargar el contenido");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color={theme.success} />;
  if (error)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );

  if (!album)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Álbum no encontrado</Text>
      </View>
    );

  const onPlayTrack = async (track: Song) => {
    try {
      player.setPlaylist(tracks);
      await player.playSong(track);
    } catch (e) {
      console.error("Error playing track:", e);
    }
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityLabel="volver-album"
      >
        <Icon name="chevron-left" size={18} color={theme.background} />
      </TouchableOpacity>
      <Image source={{ uri: album.image }} style={styles.cover} />
      <View style={styles.meta}>
        <Text style={styles.title}>{album.title}</Text>
        <Text style={styles.artist}>{album.artistName}</Text>
        <Text style={styles.artist}>{tracks.length} {isPodcast ? 'shows' : 'canciones'}</Text>
        {album.year && <Text style={styles.artist}>{album.year}</Text>}
        {album.genre && <Text style={styles.artist}>{album.genre}</Text>}
      </View>
    </View>
  );

  const content = (
    <>
      {header}
      <Text style={styles.section}>{isPodcast ? 'Shows' : 'Canciones'}</Text>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id.toString()}
        renderItem={({ item, index }) => {
          const active = player.song?.id === item.id;
          return (
            <View style={[styles.trackRow, active && styles.trackRowActive]}>
              <TouchableOpacity
                style={styles.trackContent}
                onPress={() => onPlayTrack(item)}
              >
                <Text style={styles.trackIndex}>{index + 1}</Text>
                <Image source={{ uri: item.imageUrl }} style={styles.trackImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.trackArtist} numberOfLines={1}>{item.artistName}</Text>
                    {isPodcast && item.duration && (
                      <>
                        <Text style={styles.trackArtist}>•</Text>
                        <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
                      </>
                    )}
                  </View>
                </View>
                {active && <Icon name="play-circle" size={22} color={theme.success} />}
              </TouchableOpacity>
              <View style={styles.trackActions}>
                <TouchableOpacity
                  onPress={() => player.toggleFavorite(item)}
                  style={styles.actionBtn}
                >
                  <Icon
                    name={player.isFavorited(item.id) ? "heart" : "heart-o"}
                    size={16}
                    color={player.isFavorited(item.id) ? theme.liked : theme.textTertiary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => player.addToPlaylist(item)}
                  style={styles.actionBtn}
                >
                  <Icon name="plus" size={16} color={theme.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        scrollEnabled={false}
      />
    </>
  );

  return (
    <AppLayout userName={user?.username}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        {content}
      </ScrollView>
    </AppLayout>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: theme.backgroundSecondary,
    padding: 20,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: theme.success,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cover: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.success,
    shadowColor: theme.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  meta: { width: "100%" },
  title: {
    color: theme.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    lineHeight: 30,
  },
  artist: {
    color: theme.textTertiary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  section: {
    color: theme.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundCard,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  trackRowActive: {
    backgroundColor: theme.backgroundElevated,
    borderColor: theme.success,
    borderWidth: 1.5,
  },
  trackContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  trackIndex: {
    width: 28,
    color: theme.primaryLight,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginRight: 8,
  },
  trackImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  trackTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  trackArtist: {
    color: theme.textTertiary,
    fontSize: 13,
    marginTop: 2,
  },
  trackDuration: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  trackActions: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 12,
  },
  actionBtn: {
    padding: 6,
  },
  errorText: { color: theme.error, padding: 16, fontSize: 16 },
  dataAlbum: { marginTop: 12, paddingHorizontal: 16 },
});
