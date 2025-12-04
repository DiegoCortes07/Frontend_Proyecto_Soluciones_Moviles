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
import api from "../../../../api/conexion/axiosConfig";
import Album from "../../../interfaces/Album";
import Song from "../../../interfaces/Song";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";

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
        const res = await api.get(`/albums/${id}`);
        const data = res.data;
        // Asumimos que la API devuelve { album: {...}, songs: [...] } o directamente el objeto
        if (data.album) {
          setAlbum(data.album);
          setTracks(data.songs || []);
        } else {
          // si la respuesta es el álbum con posibilidad de songs
          setAlbum(data);
          setTracks(data.songs || []);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.header}>
        <Image source={{ uri: album.image }} style={styles.cover} />
        <View style={styles.meta}>
          <Text style={styles.title}>{album.title}</Text>
          <Text style={styles.artist}>{album.artistName}</Text>
        </View>
      </View>

      <Text style={styles.section}>Canciones</Text>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.trackRow}>
            <Text style={styles.trackIndex}>{index + 1}</Text>
            <Image source={{ uri: item.imageUrl }} style={styles.trackImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackArtist}>{item.artistName}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#071428" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", padding: 16, alignItems: "center" },
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
