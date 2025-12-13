import React, { useEffect, useState } from "react";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import { useNavigation} from "@react-navigation/native";
import { View, StyleSheet, ActivityIndicator, Dimensions, ScrollView, Image } from "react-native";
import { fetchSongs } from "../../../../api/songs";
import { fetchAlbums } from "../../../../api/album";
import AppLayout from "../../../components/layout/AppLayout";
import { usePlayer } from "../../../contexts/PlayerContext";
import HomeLeftColumn from "../components/HomeLeftColumn";
import { useAuth } from "../../../contexts/AuthContext";
import Song from "../../../interfaces/Song";
import Album from "../../../interfaces/Album";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function Home() {
  const { width } = Dimensions.get("window");
  const isMobile = width < 768;
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
  

  // shared player from PlayerContext
  const player = usePlayer();
  const { playSong, setPlaylist, togglePlayPause: togglePlayerPlay, song: ctxSong, isPlaying: ctxPlaying, currentTime: ctxTime, prev, next, seek } = player;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
  const { user, token } = useAuth();

  useEffect(() => {
    loadSongs();
    loadAlbums();
  }, []);

  const loadSongs = async () => {
    try {
      const response = await fetchSongs();
      const list = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.songs)
        ? (response as any).songs
        : [];
      setSongs(list);
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

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song);
    try {
      await playSong(song);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  useEffect(() => {
    // sync playlist with player context
    setPlaylist(songs);
  }, [songs]);

  useEffect(() => {
    // keep selectedSong and play state in sync with context
    if (ctxSong) setSelectedSong(ctxSong);
    setIsPlaying(!!ctxPlaying);
    setCurrentTime(ctxTime || 0);
  }, [ctxSong, ctxPlaying, ctxTime]);

  const filteredSongs = (songs || []).filter(
    (song) =>
      (song.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (song.artistName || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchText.toLowerCase()) ||
    (album.artistName && album.artistName.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {user ? (
        <AppLayout onLogout={() => navigation.navigate("Login" as never)} userName={user.username}>
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View
              style={[
                styles.mainRow,
                isMobile && { flexDirection: "column" },
              ]}
            >
              <View style={isMobile ? { width: "100%" } : { flex: 1 }}>
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
            </View>
          </ScrollView>
        </AppLayout>
      ) : (
        <View style={{top:200,justifyContent: "center",alignItems: "center" }}>
          <Image source={{ uri: 'https://icones.pro/wp-content/uploads/2021/04/icone-spotify-bleue.png'}}
              style={{ width:"30%",height:"200%" }}>
          </Image>
          <ActivityIndicator size="large" color="#1285e4ff" style={styles.loader} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050d1a",
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 8,
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
  leftColumn: { flex: 1, minHeight: 0 },
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
