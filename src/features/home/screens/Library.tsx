import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AppLayout from "../../../components/layout/AppLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { getLikedSongs } from "../../../../api/like";
import Song from "../../../interfaces/Song";
import Playlist from "../../../interfaces/Playlist";
import {
  fetchUserPlaylists,
  getPlaylistSongs,
  deletePlaylist,
  removeSongFromPlaylist,
  changePlaylistDetails,
  uploadPlaylistImage,
} from "../../../../api/playlist";
import { usePlayer } from "../../../contexts/PlayerContext";
import { PlaylistCard } from "../components/library/PlaylistCard";
import { LikedSongCard } from "../components/library/LikedSongCard";
import { PlaylistModal } from "../components/library/PlaylistModal";
import { EditPlaylistModal } from "../components/library/EditPlaylistModal";

export default function Library() {
  const { user, token, loading } = useAuth();
  const player = usePlayer();
  const [userLikesSong, setUserLikesSong] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistSongsMap, setPlaylistSongsMap] = useState<
    Record<number, Song[]>
  >({});
  const [playlistCovers, setPlaylistCovers] = useState<Record<number, string>>(
    {}
  );
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(
    null
  );
  const [editingPlaylistId, setEditingPlaylistId] = useState<number | null>(
    null
  );

  const likedSongsToRender = React.useMemo(
    () => userLikesSong.filter((song) => player.isFavorited(song.id)),
    [userLikesSong, player]
  );

  useEffect(() => {
    loadLikes();
    loadPlaylists();
  }, [user, token]);

  const loadLikes = async () => {
    if (!user || !token) {
      setUserLikesSong([]);
      return;
    }

    try {
      const likedSongs = await getLikedSongs(token);
      setUserLikesSong(Array.isArray(likedSongs) ? likedSongs : []);
    } catch (error) {
      console.error("Error loading liked songs:", error);
    }
  };

  const loadPlaylists = async () => {
    if (!user || !token) {
      setPlaylists([]);
      setPlaylistSongsMap({});
      setPlaylistCovers({});
      return;
    }

    try {
      const userPlaylists = await fetchUserPlaylists(token);
      const list = Array.isArray(userPlaylists) ? userPlaylists : [];
      setPlaylists(list);
      const songsByPlaylist: Record<number, Song[]> = {};
      const covers: Record<number, string> = {};
      await Promise.all(
        list.map(async (pl: Playlist) => {
          try {
            const songs = await getPlaylistSongs(pl.id);
            songsByPlaylist[pl.id] = songs || [];
            if (songs && songs.length > 0 && songs[0].imageUrl) {
              covers[pl.id] = songs[0].imageUrl;
            }
          } catch (err) {
            console.error("Error fetching playlist songs:", err);
            songsByPlaylist[pl.id] = [];
          }
        })
      );
      setPlaylistSongsMap(songsByPlaylist);
      setPlaylistCovers(covers);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
  };

  const openPlaylist = (playlistId: number) => {
    setSelectedPlaylistId(playlistId);
  };

  const closePlaylist = () => setSelectedPlaylistId(null);

  const handleToggleFavorite = async (song: Song) => {
    if (!song?.id) return;
    const willBeLiked = !player.isFavorited(song.id);
    await player.toggleFavorite(song);
    setUserLikesSong((prev) => {
      if (willBeLiked) {
        return prev.some((s) => s.id === song.id) ? prev : [...prev, song];
      }
      return prev.filter((s) => s.id !== song.id);
    });
  };

  const playLikedAtIndex = async (index: number) => {
    if (likedSongsToRender.length === 0) return;
    await player.playQueue(likedSongsToRender, index);
  };

  const playPlaylistAtIndex = async (playlistId: number, index: number) => {
    const songs = playlistSongsMap[playlistId] || [];
    if (songs.length === 0) return;
    await player.playQueue(songs, index);
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    console.log("Library: handleDeletePlaylist START", playlistId);
    try {
      console.log("Library: deletePlaylist call", {
        tokenPresent: !!token,
        playlistId,
      });
      if (!token) {
        console.log("Library: No token available, aborting delete");
        return;
      }
      console.log("Library: Calling API deletePlaylist...");
      await deletePlaylist(token, playlistId);
      console.log("Library: deletePlaylist API call successful");
      console.log("Library: Reloading playlists...");
      await loadPlaylists();
      console.log("Library: Playlists reloaded");
      if (selectedPlaylistId === playlistId) {
        console.log("Library: Closing modal");
        setSelectedPlaylistId(null);
      }
      console.log("Library: handleDeletePlaylist COMPLETE");
    } catch (e) {
      console.error("Library: Error deleting playlist:", e);
    }
  };

  const handleRemoveSongFromPlaylist = async (
    playlistId: number,
    song: Song
  ) => {
    console.log("Library: handleRemoveSongFromPlaylist START", {
      playlistId,
      songId: song.id,
      songTitle: song.title,
    });
    try {
      console.log("Library: removeSongFromPlaylist call", {
        tokenPresent: !!token,
        playlistId,
        songId: song.id,
      });
      if (!token) {
        console.log("Library: No token available, aborting remove");
        return;
      }
      console.log("Library: Calling API removeSongFromPlaylist...");
      await removeSongFromPlaylist(token, playlistId, song.id);
      console.log("Library: removeSongFromPlaylist API call successful");
      console.log("Library: Reloading playlists...");
      await loadPlaylists();
      console.log("Library: Playlists reloaded");
      console.log("Library: handleRemoveSongFromPlaylist COMPLETE");
    } catch (err) {
      console.error("Library: Error removing song from playlist:", err);
    }
  };

  const handleEditPlaylist = async (name: string, description: string) => {
    console.log("Library: handleEditPlaylist", {
      playlistId: editingPlaylistId,
      name,
      description,
    });
    if (!token || editingPlaylistId === null) return;

    try {
      await changePlaylistDetails(token, editingPlaylistId, name, description);
      console.log("Library: Playlist details updated successfully");
      await loadPlaylists();
    } catch (error) {
      console.error("Library: Error updating playlist details:", error);
      throw error;
    }
  };

  const handleUploadPlaylistImage = async (imageFile: any) => {
    console.log("Library: handleUploadPlaylistImage", {
      playlistId: editingPlaylistId,
    });
    if (!token || editingPlaylistId === null) return;

    try {
      await uploadPlaylistImage(token, editingPlaylistId, imageFile);
      console.log("Library: Playlist image uploaded successfully");
      await loadPlaylists();
    } catch (error) {
      console.error("Library: Error uploading playlist image:", error);
      throw error;
    }
  };

  const content = (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Biblioteca</Text>
      <Text style={styles.section}>Playlists</Text>
      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin playlists por ahora.. :(</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={playlists}
          keyExtractor={(i) => i.id.toString()}
          renderItem={({ item }) => (
            <PlaylistCard
              playlist={item}
              coverImage={playlistCovers[item.id]}
              onPress={() => openPlaylist(item.id)}
              cantSongs={(playlistSongsMap[item.id] || []).length}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      )}

      <Text style={[styles.section, { marginTop: 18 }]}>Me gusta</Text>
      <TouchableOpacity
        style={styles.playAllButton}
        onPress={() =>
          likedSongsToRender.length > 0 &&
          player.playQueue(likedSongsToRender, 0)
        }
      >
        <Text style={styles.playAllText}>Reproducir todo</Text>
      </TouchableOpacity>
      <FlatList
        horizontal
        data={likedSongsToRender}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item, index }) => (
          <LikedSongCard
            song={item}
            isFavorited={player.isFavorited(item.id)}
            onPress={() => playLikedAtIndex(index)}
            onToggleFavorite={() => handleToggleFavorite(item)}
            onAddToPlaylist={() => player.addToPlaylist(item)}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />

      <PlaylistModal
        visible={selectedPlaylistId !== null}
        playlistId={selectedPlaylistId || 0}
        playlistName={
          selectedPlaylistId
            ? playlists.find((p) => p.id === selectedPlaylistId)?.name ||
              "Playlist"
            : "Playlist"
        }
        playlistDescription={
          selectedPlaylistId
            ? playlists.find((p) => p.id === selectedPlaylistId)?.description ||
              ""
            : ""
        }
        playlistImage={
          selectedPlaylistId ? playlistCovers[selectedPlaylistId] || null : null
        }
        songs={
          selectedPlaylistId !== null
            ? playlistSongsMap[selectedPlaylistId] || []
            : []
        }
        isFavorited={player.isFavorited}
        onClose={closePlaylist}
        onPlayAll={() => {
          if (selectedPlaylistId !== null) {
            const songs = playlistSongsMap[selectedPlaylistId] || [];
            if (songs.length > 0) {
              player.playQueue(songs, 0);
            }
          }
        }}
        onSongPress={(index) => {
          if (selectedPlaylistId !== null) {
            playPlaylistAtIndex(selectedPlaylistId, index);
          }
        }}
        onToggleFavorite={handleToggleFavorite}
        onAddToPlaylist={player.addToPlaylist}
        onRemoveSong={(song) => {
          if (selectedPlaylistId !== null) {
            handleRemoveSongFromPlaylist(selectedPlaylistId, song);
          }
        }}
        onDeletePlaylist={() => {
          if (selectedPlaylistId !== null) {
            handleDeletePlaylist(selectedPlaylistId);
          }
        }}
        onEditPlaylist={() => {
          if (selectedPlaylistId !== null) {
            setEditingPlaylistId(selectedPlaylistId);
          }
        }}
      />

      <EditPlaylistModal
        visible={editingPlaylistId !== null}
        playlistId={editingPlaylistId || 0}
        currentName={
          editingPlaylistId
            ? playlists.find((p) => p.id === editingPlaylistId)?.name || ""
            : ""
        }
        currentDescription={
          editingPlaylistId
            ? playlists.find((p) => p.id === editingPlaylistId)?.description ||
              ""
            : ""
        }
        currentImage={
          editingPlaylistId ? playlistCovers[editingPlaylistId] || null : null
        }
        onClose={() => setEditingPlaylistId(null)}
        onSave={handleEditPlaylist}
        onUploadImage={handleUploadPlaylistImage}
      />
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#1DB954" style={{ flex: 1 }} />
    );
  }

  return <AppLayout userName={user?.username}>{content}</AppLayout>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#050d1a",
  },
  title: {
    color: "#f2f6ff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  section: {
    color: "#dfe8ff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 2,
  },
  playAllButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1DB954",
    borderRadius: 999,
    marginBottom: 10,
    shadowColor: "#1DB954",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  playAllText: {
    color: "#031427",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#9fb4d6",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
