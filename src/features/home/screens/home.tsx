import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { fetchSongs } from "../../../../api/songs";
import { fetchAlbums } from "../../../../api/album";
import Icon from "react-native-vector-icons/FontAwesome";
import { AudioPlayer, useAudioPlayer } from "expo-audio"; // Usando expo-audio

// Tipos de Song y Album (si es necesario para TypeScript)
interface Song {
  id: number;
  title: string;
  artistName: string;
  imageUrl: string;
  cloudinarySecureUrl: string;
}

interface Album {
  id: number;
  title: string;
  image: string;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const player = useAudioPlayer();
  const navigation = useNavigation();

  // Función para cargar canciones
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

  // Función para cargar álbumes
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

  useEffect(() => {
    loadSongs();
    loadAlbums();
  }, []);

  // Manejo de selección de canción
  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song);
    player.seekTo(0);
    player.replace(song.cloudinarySecureUrl);
    player.play();
    setIsPlaying(true);
  };

  // Alternar entre Play/Pause
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

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchText.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredAlbums = albums.filter((album) =>
    album.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatTime = (segundos: number) => {
    if (isNaN(segundos) || segundos < 0) {
      return "0:00";
    }

    const minutes = Math.floor(segundos / 60);
    const seconds = Math.floor(segundos % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(player.currentTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, player.currentTime]);

  const handleSliderChange = async (value: number) => {
    setCurrentTime(value * player.duration);
    await player.seekTo(value * player.duration);
  };

  const logout = async () => {
    navigation.navigate("Login");
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
        {/* Barra de perfil */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://www.example.com/profile.jpg" }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Bienvenido!</Text>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#bbb"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar canciones o álbumes..."
            placeholderTextColor="#bbb"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Lista de canciones */}
        <Text style={styles.sectionTitle}>Todas las Canciones</Text>
        {loadingSongs ? (
          <ActivityIndicator
            size="large"
            color="#1DB954"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filteredSongs}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSongSelect(item)}>
                <View style={styles.songItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.songImage}
                  />
                  <Text style={styles.songTitle}>{item.title}</Text>
                  <Text style={styles.songArtist}>{item.artistName}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}

        {/* Lista de álbumes */}
        <Text style={styles.sectionTitle}>Álbumes</Text>
        {loadingAlbums ? (
          <ActivityIndicator
            size="large"
            color="#1DB954"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filteredAlbums}
            renderItem={({ item }) => (
              <View style={styles.albumItem}>
                <Image source={{ uri: item.image }} style={styles.albumImage} />
                <Text style={styles.albumTitle}>{item.title}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </ScrollView>

      {/* Reproductor flotante */}
      <View style={styles.playerContainer}>
        <View style={styles.player}>
          {selectedSong ? (
            <>
              <Image
                source={{ uri: selectedSong.imageUrl }}
                style={styles.songImagePlayer}
              />
              <Text style={styles.songTitle}>{selectedSong.title}</Text>
              <Text style={styles.songArtist}>{selectedSong.artistName}</Text>
            </>
          ) : (
            <Text style={styles.noSongText}>No hay canción seleccionada</Text>
          )}
          <View style={styles.controls}>
            <TouchableOpacity>
              <Icon name="backward" size={35} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={togglePlayPause}
              style={[
                styles.button,
                isPlaying ? styles.pauseButton : styles.playButton,
              ]}
            >
              <Icon
                name={isPlaying ? "pause" : "play"}
                size={35}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="forward" size={35} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(player.duration)}
            </Text>
          </View>

          {/* Slider */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={player.duration ? currentTime / player.duration : 0}
            onValueChange={handleSliderChange}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#fff"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },
  scrollContent: {
    paddingBottom: 100, // Esto asegura que el ScrollView no se superponga con el reproductor
  },
  player: {
    width: "100%",
    alignItems: "center",
  },
  slider: {
    width: "100%",
    marginTop: 20,
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
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 10,
  },
  songItem: {
    marginRight: 15,
    backgroundColor: "#453b3bff",
    borderRadius: 20,
    width: 180,
    alignItems: "center",
    padding: 10,
    marginBottom: 15,
  },
  songImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  songArtist: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
  },
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
  playerContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 20,
    width: 380,
    height: 380,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#20321eff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  playButton: {
    backgroundColor: "#1DB954",
  },
  pauseButton: {
    backgroundColor: "#FF5722",
  },
  timeContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  timeText: {
    color: "#fff",
    fontSize: 16,
  },
  songImagePlayer: {
    width: "60%",
    height: 150,
    borderRadius: 20,
    marginBottom: 10,
  },
  noSongText: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
  },
  logoutButton: {
    backgroundColor: "#367d57ff",
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 
