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
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import Album from "../../../interfaces/Album";
import Props from "../../../interfaces/Props";
import Artist from "../../../interfaces/Artist";
import { getArtistForId } from "../../../../api/artist";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

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
  const [expandedArtist, setExpandedArtist] = React.useState<string | null>(
    null
  );
  const [artistCache, setArtistCache] = React.useState<
    Record<number, Artist | null>
  >({});
  const [modalArtist, setModalArtist] = React.useState<Artist | null>(null);
  const [artistLoading, setArtistLoading] = React.useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const artists = React.useMemo(() => {
    const map = new Map<string, { id?: number; name: string }>();
    for (const s of songs) {
      const key = s.artistName;
      if (!map.has(key)) {
        map.set(key, { id: (s as any).artistId, name: s.artistName });
      }
    }
    return Array.from(map.values()).slice(0, 12);
  }, [songs]);

  const toggleArtist = (name: string) => {
    setExpandedArtist((prev) => (prev === name ? null : name));
  };

  const fetchArtistIfNeeded = async (artistId?: number) => {
    if (!artistId) return null;
    if (artistCache[artistId]) return artistCache[artistId];
    try {
      setArtistLoading(true);
      const data = await getArtistForId(artistId);
      setArtistCache((prev) => ({ ...prev, [artistId]: data }));
      return data;
    } catch (e) {
      console.error("Error fetching artist:", e);
      return null;
    } finally {
      setArtistLoading(false);
    }
  };

  const showArtistModal = async (artistId?: number) => {
    if (!artistId) return;
    const cached = artistCache[artistId];
    if (cached) {
      setModalArtist(cached);
      return;
    }
    const artist = await fetchArtistIfNeeded(artistId);
    if (artist) setModalArtist(artist);
  };

  React.useEffect(() => {
    (async () => {
      for (const a of artists) {
        if (a.id && !artistCache[a.id]) {
          await fetchArtistIfNeeded(a.id);
        }
      }
    })();
  }, [artists]);
  const defaultAvatar =
    "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";
  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { flexGrow: 1, paddingBottom: barHeight + 16 },
      ]}
      style={[styles.leftColumn, { flex: 1 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: user.profilePhoto
              ? user.profilePhoto
              : "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=",
          }}
          style={styles.profileImage}
        />
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
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.songImage}
                />
                <Text style={styles.songTitle}>{item.title}</Text>
                <TouchableOpacity
                  onPress={() => showArtistModal(item.artistId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.artistLink}>{item.artistName}</Text>
                </TouchableOpacity>
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
          renderItem={({ item }) => {
            const cachedArtist = item.artistId
              ? artistCache[item.artistId]
              : null;
            return (
              <View style={styles.albumItem}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Album", { id: item.id })}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.albumImage}
                  />
                </TouchableOpacity>
                <Text style={styles.albumTitle}>{item.title}</Text>
                <TouchableOpacity
                  onPress={() => showArtistModal(item.artistId)}
                  activeOpacity={0.8}
                >
                  <View style={styles.albumArtistRow}>
                    <Image
                      source={{ uri: (cachedArtist && cachedArtist.image) ? cachedArtist.image : defaultAvatar }}
                      style={styles.albumArtistImage}
                    />
                    <Text style={styles.artistLink}>{item.artistName}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}

      <Text style={styles.sectionTitle}>Artistas</Text>

      {(() => {
        const q = (searchText || "").toLowerCase().trim();
        const filtered = q
          ? artists.filter((a) => a.name.toLowerCase().includes(q))
          : artists;
        return (
          <FlatList
            data={filtered}
            horizontal
            keyExtractor={(a) => a.name}
            renderItem={({ item }) => {
              const cached = item.id ? artistCache[item.id] : null;
              return (
                <TouchableOpacity
                  onPress={() => showArtistModal(item.id)}
                  onLongPress={() => toggleArtist(item.name)}
                  style={{ marginRight: 12 }}
                >
                  <View style={{ alignItems: "center", width: 120 }}>
                    {cached && cached.image ? (
                      <Image
                        source={{ uri: cached.image }}
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                      />
                    ) : (
                      <Image
                        source={{ uri: defaultAvatar }}
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                      />
                    )}
                    <Text
                      style={{
                        color: "#fff",
                        marginTop: 6,
                        maxWidth: 120,
                        textAlign: "center",
                      }}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />
        );
      })()}

      {expandedArtist && (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.sectionTitle, { fontSize: 20 }]}>
            Canciones de {expandedArtist}
          </Text>
          <FlatList
            data={songs.filter((s) => s.artistName === expandedArtist)}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSongSelect(item)}>
                <View style={styles.songItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.songImage}
                  />
                  <Text style={styles.songTitle}>{item.title}</Text>
                  <TouchableOpacity
                    onPress={() => showArtistModal(item.artistId)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.artistLink}>{item.artistName}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      <View>
        <Text style={styles.sectionTitle}>Recomendados para ti</Text>
        {loadingSongs ? (
          <ActivityIndicator
            size="large"
            color="#1DB954"
            style={styles.loader}
          />
        ) : (
          <FlatList<Song>
            data={filteredSongs}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSongSelect(item)}>
                <View style={styles.songItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.songImage}
                  />
                  <Text style={styles.songTitle}>{item.title}</Text>
                  <TouchableOpacity
                    onPress={() => showArtistModal(item.artistId)}
                  >
                    <Text style={styles.artistLink}>{item.artistName}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      {modalArtist && (
        <Modal visible={!!modalArtist} transparent animationType="slide">
          <View style={styles.artistDetailContainer}>
            <View style={styles.artistDetailHeader}>
              <TouchableOpacity
                onPress={() => setModalArtist(null)}
                style={styles.closeButton}
              >
                <Icon name="chevron-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Image
                source={{ uri: modalArtist.image || defaultAvatar }}
                style={styles.artistDetailImage}
              />
              <Text style={styles.artistDetailName}>{modalArtist.name}</Text>
              <Text style={styles.artistDetailDesc}>
                {modalArtist.description}
              </Text>
            </View>
            <View style={styles.artistSongsContainer}>
              <Text style={styles.artistSongsTitle}>Canciones</Text>
              {artistLoading ? (
                <ActivityIndicator size="large" color="#1DB954" />
              ) : (
                <FlatList<Song>
                  data={songs.filter((s) => s.artistId === modalArtist.id)}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        onSongSelect(item);
                        setModalArtist(null);
                      }}
                      style={styles.artistSongItem}
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.artistSongImage}
                      />
                      <View style={styles.artistSongInfo}>
                        <Text style={styles.artistSongTitle}>{item.title}</Text>
                        <Text style={styles.artistSongArtist}>
                          {item.artistName}
                        </Text>
                      </View>
                      <Icon name="play-circle" size={28} color="#1DB954" />
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={true}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      No hay canciones disponibles
                    </Text>
                  }
                />
              )}
            </View>
          </View>
        </Modal>
      )}
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
  leftColumn: { flex: 1, minHeight: 0 },
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
  albumArtistRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  albumArtistImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  artistDetailContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  artistDetailHeader: {
    backgroundColor: "#1a1a1a",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  artistDetailImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#1DB954",
  },
  artistDetailName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  artistDetailDesc: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  artistSongsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  artistSongsTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  artistSongItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  artistSongImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  artistSongInfo: {
    flex: 1,
  },
  artistSongTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  artistSongArtist: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
  },
  artistLink: {
    color: "#1DB954",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 6,
    textAlign: "center",
  },
});

export default HomeLeftColumn;
