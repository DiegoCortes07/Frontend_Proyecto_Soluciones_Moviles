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
import { fetchSongsByAlbum, fetchAlbumDetails} from "../../../../api/album";
import { useRoute, RouteProp } from "@react-navigation/native";
import { usePlayer } from "../../../contexts/PlayerContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import AppLayout from "../../../components/layout/AppLayout";
import { useAuth } from "../../../contexts/AuthContext";
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
  albumId?: number | string;
};

export default function AlbumScreen({ albumId }: Props) {
  const route = useRoute<RouteProp<Record<string, { id?: string }>, string>>();
  const paramId = route?.params?.id;
  const id = albumId ?? paramId;

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const player = usePlayer();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, loading: authLoading } = useAuth();

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
        const albumRes = await fetchAlbumDetails(id);
        const res = await fetchSongsByAlbum(id);

        if (albumRes) {
          setAlbum(albumRes);
          setTracks(res || []);
        } else {
          setTracks(res || []);
          setAlbum(albumRes);
        }
      } catch (e: any) {
        console.error("Error fetching album:", e);
        setError(e?.message || "Error al cargar el álbum");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#1DB954" />;
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
        <Icon name="chevron-left" size={18} color="#071428" />
      </TouchableOpacity>
      <Image source={{ uri: album.image }} style={styles.cover} />
      <View style={styles.meta}>
        <Text style={styles.title}>{album.title}</Text>
        <Text style={styles.artist}>{album.artistName}</Text>
      </View>
    </View>
  );

  const content = (
    <>
      {header}
      <Text style={styles.section}>Canciones</Text>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id.toString()}
        renderItem={({ item, index }) => {
          const active = player.song?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.trackRow, active ? { backgroundColor: "#071f30", borderRadius: 8, paddingHorizontal: 8 } : undefined]}
              onPress={() => onPlayTrack(item)}
            >
              <Text style={styles.trackIndex}>{index + 1}</Text>
              <Image source={{ uri: item.imageUrl }} style={styles.trackImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackArtist}>{item.artistName}</Text>
              </View>
              {active && <Text style={{ color: "#1DB954", marginLeft: 8 }}>Reproduciendo</Text>}
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#071428" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", padding: 16, alignItems: "center" },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eaf6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cover: { width: 160, height: 160, borderRadius: 8, marginRight: 16 },
  meta: { flex: 1 },
  title: { color: "#eaf6ff", fontSize: 22, fontWeight: "700", marginBottom: 6 },
  artist: { color: "#bbb", fontSize: 16 },
  section: { color: "#fff", fontSize: 18, fontWeight: "700", marginHorizontal: 16, marginTop: 8 },
  trackRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  trackIndex: { width: 24, color: "#9fd6ff", textAlign: "center", marginRight: 8 },
  trackImage: { width: 56, height: 56, borderRadius: 6, marginRight: 12 },
  trackTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  trackArtist: { color: "#bbb", fontSize: 13 },
  errorText: { color: "#ffdddd", padding: 16 },
});
