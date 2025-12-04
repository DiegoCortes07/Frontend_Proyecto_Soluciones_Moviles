import React from "react";
import Song from "../../../interfaces/Song";
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
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import Album from "../../../interfaces/Album";
import Props from "../../../interfaces/Props";

const HomeLeftColumn: React.FC<Props> = ({
  user,
  songs,
  filteredSongs,
  loadingSongs,
  albums,
  filteredAlbums,
  loadingAlbums,
  searchText,
  setSearchText,
  onSongSelect,
  barHeight,
}) => {
  const [expandedArtist, setExpandedArtist] = React.useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const artists = Array.from(new Set(songs.map((s) => s.artistName))).slice(0, 12);

  const toggleArtist = (name: string) => {
    setExpandedArtist((prev) => (prev === name ? null : name));
  };
  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { flexGrow: 1, paddingBottom: barHeight + 16 }]}
      style={[styles.leftColumn, { flex: 1 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      <View style={styles.profileContainer}>
        <Image source={{ uri: user.profilePhoto ? user.profilePhoto : "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=" }} style={styles.profileImage} />
        <Text style={styles.profileName}>Bienvenido, {user.username}!</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#bbb" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar canciones, álbumes o artistas..."
          placeholderTextColor="#bbb"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <Text style={styles.sectionTitle}>Todas las Canciones</Text>
      {loadingSongs ? (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      ) : (
        <FlatList<Song>
          data={filteredSongs}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSongSelect(item)}>
              <View style={styles.songItem}>
                <Image source={{ uri: item.imageUrl }} style={styles.songImage} />
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

      <Text style={styles.sectionTitle}>Álbumes</Text>
      {loadingAlbums ? (
        <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
      ) : (
        <FlatList<Album>
          data={filteredAlbums}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.albumItem} onPress={() => navigation.navigate("Album", { id: item.id })}>
              <Image source={{ uri: item.image }} style={styles.albumImage} />
              <Text style={styles.albumTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}

      <Text style={styles.sectionTitle}>Artistas</Text>
      <FlatList
        data={artists}
        horizontal
        keyExtractor={(a) => a}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleArtist(item)} style={{ marginRight: 12 }}>
            <View style={{ alignItems: "center" }}>
              <View style={{ width: 80, height: 80, borderRadius: 50, backgroundColor: "#333", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff" }}>{item[0]}</Text>
              </View>
              <Text style={{ color: "#fff", marginTop: 6, maxWidth: 80, textAlign: "center" }} numberOfLines={1}>{item}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />

      {expandedArtist && (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>Canciones de {expandedArtist}</Text>
          <FlatList
            data={songs.filter((s) => s.artistName === expandedArtist)}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSongSelect(item)}>
                <View style={styles.songItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.songImage} />
                  <Text style={styles.songTitle}>{item.title}</Text>
                  <Text style={styles.songArtist}>{item.artistName}</Text>
                </View>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      // Recomendados
      <View>
        <Text style={styles.sectionTitle}>Recomendados para ti</Text>
        {loadingSongs ? (
          <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
        ) : (
          <FlatList<Song>
            data={filteredSongs}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSongSelect(item)}>
                <View style={styles.songItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.songImage} />
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
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 140, paddingTop: 12 },
  loader: { marginVertical: 12 },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 15,
    elevation: 5,
  },
  profileImage: { width: 50, height: 50, borderRadius: 50, marginRight: 10 },
  profileName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#333", borderRadius: 30, paddingHorizontal: 15, paddingVertical: 10, marginBottom: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#fff", fontSize: 16 },
  sectionTitle: { color: "#fff", fontSize: 28, fontWeight: "bold", marginVertical: 10 },
  leftColumn: { flex: 1, minHeight: 0 },
  songItem: { marginRight: 15, backgroundColor: "#453b3bff", borderRadius: 20, width: 180, alignItems: "center", padding: 10, marginBottom: 15 },
  songImage: { width: "100%", height: 120, borderRadius: 10, marginBottom: 10 },
  songTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  songArtist: { color: "#bbb", fontSize: 14, textAlign: "center" },
  albumItem: { marginRight: 20, alignItems: "center", marginBottom: 10, backgroundColor: "#333", borderRadius: 15, padding: 10 },
  albumImage: { width: 140, height: 140, borderRadius: 10, borderWidth: 2, borderColor: "#444" },
  albumTitle: { color: "#fff", marginTop: 10, fontSize: 16, fontWeight: "bold", textAlign: "center" },
});

export default HomeLeftColumn;
