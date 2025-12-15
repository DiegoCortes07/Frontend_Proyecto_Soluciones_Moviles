import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import Artist from "../../../interfaces/Artist";
import Props from "../../../interfaces/Props";
import { getArtistForId } from "../../../../api/artist";
import { usePlayer } from "../../../contexts/PlayerContext";
import { ProfileHeader } from "./ProfileHeader";
import { SearchBar } from "./SearchBar";
import { SongsList } from "./SongsList";
import { AlbumsList } from "./AlbumsList";
import { PodcastsList } from "./PodcastsList";
import { ArtistsList } from "./ArtistsList";
import { ArtistDetailModal } from "./ArtistDetailModal";
import { useTheme } from "../../../contexts/ThemeContext";

const HomeLeftColumn: React.FC<Props> = ({
  user,
  songs,
  filteredSongs,
  loadingSongs,
  albums,
  filteredAlbums,
  loadingAlbums,
  podcasts,
  filteredPodcasts,
  loadingPodcasts,
  searchText,
  setSearchText,
  onSongSelect,
  barHeight,
}) => {
  const { theme } = useTheme();
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
  const player = usePlayer();

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

  const artistSongs = modalArtist
    ? songs.filter((s) => s.artistId === modalArtist.id)
    : [];
  const expandedArtistSongs = expandedArtist
    ? songs.filter((s) => s.artistName === expandedArtist)
    : [];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { flexGrow: 1, paddingBottom: barHeight + 16 },
      ]}
      style={[styles.leftColumn, { flex: 1, backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      <ProfileHeader user={user} />

      <SearchBar value={searchText} onChangeText={setSearchText} />

      <SongsList
        title="Todas las Canciones"
        songs={filteredSongs}
        loading={loadingSongs}
        isFavorited={player.isFavorited}
        onSongPress={onSongSelect}
        onArtistPress={showArtistModal}
        onToggleFavorite={player.toggleFavorite}
        onAddToPlaylist={player.addToPlaylist}
      />

      <AlbumsList
        albums={filteredAlbums}
        loading={loadingAlbums}
        artistCache={artistCache}
        onAlbumPress={(id) => navigation.navigate("Album", { id })}
        onArtistPress={showArtistModal}
      />

      <PodcastsList
        podcasts={filteredPodcasts}
        loading={loadingPodcasts}
        artistCache={artistCache}
        onPodcastPress={(id) => navigation.navigate("Album", { id })}
        onArtistPress={showArtistModal}
      />

      <ArtistsList
        artists={artists}
        artistCache={artistCache}
        searchText={searchText}
        onArtistPress={showArtistModal}
        onArtistLongPress={toggleArtist}
      />

      {expandedArtist && (
        <SongsList
          title={`Canciones de ${expandedArtist}`}
          songs={expandedArtistSongs}
          isFavorited={player.isFavorited}
          onSongPress={onSongSelect}
          onArtistPress={showArtistModal}
          onToggleFavorite={player.toggleFavorite}
          onAddToPlaylist={player.addToPlaylist}
        />
      )}

      <SongsList
        title="Recomendados para ti"
        songs={filteredSongs}
        loading={loadingSongs}
        isFavorited={player.isFavorited}
        onSongPress={onSongSelect}
        onArtistPress={showArtistModal}
        onToggleFavorite={player.toggleFavorite}
        onAddToPlaylist={player.addToPlaylist}
      />

      <ArtistDetailModal
        artist={modalArtist}
        songs={artistSongs}
        loading={artistLoading}
        isFavorited={player.isFavorited}
        onClose={() => setModalArtist(null)}
        onSongPress={onSongSelect}
        onToggleFavorite={player.toggleFavorite}
        onAddToPlaylist={player.addToPlaylist}
      />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  leftColumn: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 120,
  },
  loader: {
    marginVertical: 12,
  },
  flatListContainer: {
    overflow: "hidden",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#f4f8ff",
    fontSize: 26,
    fontWeight: "800",
    marginVertical: 12,
  },
});

export default HomeLeftColumn;
