import React, { useEffect, useState } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import { useNavigation} from "@react-navigation/native";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { fetchSongs } from "../../../../api/songs";
import { fetchAlbums } from "../../../../api/album";
import { useAudioPlayer } from "expo-audio";
import AppLayout from "../../../components/layout/AppLayout";
import NowPlayingBar from "../../../components/NowPlayingBar";
import HomeLeftColumn from "../components/HomeLeftColumn";
import { useAuth } from "../../../contexts/AuthContext";
import Song from "../../../interfaces/Song";
import Album from "../../../interfaces/Album";
import User from "../../../interfaces/User";
import { me } from "../../../../api/auth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [barHeight, setBarHeight] = useState<number>(84);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  

  const player = useAudioPlayer();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
  const { user, token } = useAuth();

  useEffect(() => {
    loadSongs();
    loadAlbums();
  }, []);

  const loadSongs = async () => {
    try {
      const response = await fetchSongs();
      setSongs(response);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoadingSongs(false);
    }
  };

  const loadAlbums = async () => {
    try {
      const response = await fetchAlbums();
      setAlbums(response);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoadingAlbums(false);
    }
  };

  // user provided by AuthContext

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song);
    try {
      player.seekTo(0);
      await player.replace(song.cloudinarySecureUrl);
      await player.play();
      setIsPlaying(true);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      } else {
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(player.currentTime || 0);
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isPlaying, player.currentTime]);

  const prevSong = async () => {
    if (!selectedSong || songs.length === 0) return;
    const idx = songs.findIndex((s) => s.id === selectedSong.id);
    const newIdx = idx > 0 ? idx - 1 : songs.length - 1;
    await handleSongSelect(songs[newIdx]);
  };

  const nextSong = async () => {
    if (!selectedSong || songs.length === 0) return;
    const idx = songs.findIndex((s) => s.id === selectedSong.id);
    const newIdx = idx < songs.length - 1 ? idx + 1 : 0;
    await handleSongSelect(songs[newIdx]);
  };

  const handleSeek = async (time: number) => {
    setCurrentTime(time);
    await player.seekTo(time);
  };

  const toggleFavorite = (song: Song) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(song.id)) next.delete(song.id);
      else next.add(song.id);
      return next;
    });
  };

  const handleAddToPlaylist = (song: Song) => {
    Alert.alert(
      "Añadir a playlist",
      `Agregar "${song.title}" a una playlist (placeholder).`
    );
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchText.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {user ? (
        <AppLayout onLogout={() => navigation.navigate("Login" as never)} userName={user.username}>
          <ScrollView
            style={[styles.scrollContent]}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={[styles.mainRow, { alignItems: "stretch" }]}>
              <HomeLeftColumn
                user={user}
                songs={songs}
                filteredSongs={filteredSongs}
                loadingSongs={loadingSongs}
                albums={albums}
                filteredAlbums={filteredAlbums}
                loadingAlbums={loadingAlbums}
                searchText={searchText}
                setSearchText={setSearchText}
                onSongSelect={handleSongSelect}
                barHeight={barHeight}
              />
            </View>
          </ScrollView>
        </AppLayout>
      ) : (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      )}

      <NowPlayingBar
        song={selectedSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={player.duration}
        onPlayPause={togglePlayPause}
        onPrev={prevSong}
        onNext={nextSong}
        onSeek={handleSeek}
        onBarLayout={(h: number) => setBarHeight(h)}
        onToggleFavorite={(s: Song) => toggleFavorite(s)}
        onAddToPlaylist={(s: Song) => handleAddToPlaylist(s)}
        isFavorited={selectedSong ? favorites.has(selectedSong.id) : false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 12,
  },
  loader: {
    marginVertical: 12,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 15,
    elevation: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  profileName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 16 },
  sectionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 10,
  },
  mainRow: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  leftColumn: { flex: 0, minHeight: 0 },
  panelTitle: {
    color: "#eaf6ff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  panelAlbumItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  panelAlbumImage: { width: 64, height: 64, borderRadius: 8 },
  panelAlbumTitle: { color: "#eaf6ff", marginLeft: 5, fontSize: 14 },
  recoItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  recoImage: { width: 48, height: 48, borderRadius: 6 },
  songItem: {
    marginRight: 15,
    backgroundColor: "#453b3bff",
    borderRadius: 20,
    width: 180,
    alignItems: "center",
    padding: 10,
    marginBottom: 15,
  },
  songImage: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10 },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  songArtist: { color: "#bbb", fontSize: 14, textAlign: "center" },
  albumItem: {
    marginRight: 20,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#333",
    borderRadius: 15,
    padding: 10,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#444",
  },
  albumTitle: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
