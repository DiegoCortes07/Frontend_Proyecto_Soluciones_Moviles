import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { getPlaylistSongs } from "../../api/playlist";

type Playlist = {
  id: number;
  name: string;
  description?: string;
};

const PlaylistPicker: React.FC<{
  visible: boolean;
  playlists: Playlist[];
  loading?: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
  onCreate: (name: string, description?: string) => Promise<any>;
  onAddSong: (playlistId: number, songId?: number) => Promise<any>;
  onDeletePlaylist: (playlistId: number) => Promise<any>;
  onRemoveSong: (playlistId: number, songId: number) => Promise<any>;
  songToAddId?: number;
  songToAddTitle?: string;
}> = ({
  visible,
  playlists,
  loading,
  onClose,
  onRefresh,
  onCreate,
  onAddSong,
  onDeletePlaylist,
  onRemoveSong,
  songToAddId,
  songToAddTitle,
}) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [playlistSongs, setPlaylistSongs] = useState<any[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  useEffect(() => {
    if (visible) {
      onRefresh && onRefresh();
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      setOperationLoading(true);
      await onCreate(name.trim(), description.trim());
      setName("");
      setDescription("");
      setCreating(false);
    } catch (e) {
      console.error(e);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAdd = async (playlistId: number) => {
    try {
      setOperationLoading(true);
      // pass explicit song id if provided by provider, else provider may fallback
      await onAddSong(playlistId, songToAddId);
      // onAddSong is expected to close the picker
    } catch (e) {
      console.error(e);
    } finally {
      setOperationLoading(false);
    }
  };

  const openPlaylist = async (p: Playlist) => {
    setSelectedPlaylist(p);
    setSongsLoading(true);
    try {
      const songs = await getPlaylistSongs(p.id);
      setPlaylistSongs(Array.isArray(songs) ? songs : []);
    } catch (e) {
      console.error(e);
      setPlaylistSongs([]);
    } finally {
      setSongsLoading(false);
    }
  };

  const confirmDeletePlaylist = (playlistId: number) => {
    Alert.alert(
      "Eliminar playlist",
      "¿Estás seguro de que quieres eliminar esta playlist? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
              try {
                console.log('PlaylistPicker: calling onDeletePlaylist', { playlistId });
                setOperationLoading(true);
                await onDeletePlaylist(playlistId);
                onRefresh && onRefresh();
              } catch (e) {
                console.error(e);
              } finally {
                setOperationLoading(false);
              }
          },
        },
      ]
    );
  };

  const confirmRemoveSong = (playlistId: number, songId: number) => {
    Alert.alert("Eliminar canción", "¿Eliminar esta canción de la playlist?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
            try {
              console.log('PlaylistPicker: calling onRemoveSong', { playlistId, songId });
              setOperationLoading(true);
              await onRemoveSong(playlistId, songId);
              // Optimistically remove the song from local state so the UI updates immediately
              setPlaylistSongs((prev) => prev.filter((s) => s.id !== songId));
              // Also attempt to refresh from API to keep in sync (non-blocking)
              try {
                const songs = await getPlaylistSongs(playlistId);
                setPlaylistSongs(Array.isArray(songs) ? songs : []);
              } catch (e) {
                // ignore refresh errors, local optimistic update already applied
                console.warn("Could not refresh playlist songs after removal", e);
              }
            } catch (e) {
              console.error(e);
            } finally {
              setOperationLoading(false);
            }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Agregar a playlist</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="close-playlist-picker"
            >
              <Text style={styles.close}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#1DB954" />
          ) : selectedPlaylist ? (
            <View>
              <View style={styles.playlistDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPlaylist(null)}>
                  <Text style={styles.close}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.playlistTitle}>
                  {selectedPlaylist.name}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPlaylistMenu(!showPlaylistMenu)}
                >
                  <Icon name="ellipsis-v" size={18} color="#9fb4d6" />
                </TouchableOpacity>
              </View>
              {showPlaylistMenu && (
                <View style={styles.playlistMenuOverlay}>
                  <TouchableOpacity
                    style={styles.playlistMenuItem}
                    onPress={() => {
                      setShowPlaylistMenu(false);
                      Alert.alert('Configuración', 'Configuración de playlist (próximamente)');
                    }}
                  >
                    <Icon name="cog" size={16} color="#9fb4d6" />
                    <Text style={styles.playlistMenuItemText}>Configuración</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.playlistMenuItem, { borderTopColor: '#133b63', borderTopWidth: 1 }]}
                    onPress={() => {
                      setShowPlaylistMenu(false);
                      confirmDeletePlaylist(selectedPlaylist.id);
                    }}
                  >
                    <Icon name="trash" size={16} color="#ff6b6b" />
                    <Text style={[styles.playlistMenuItemText, { color: '#ff6b6b' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
              {songsLoading ? (
                <ActivityIndicator size="small" color="#1DB954" />
              ) : (
                <FlatList
                  data={playlistSongs}
                  keyExtractor={(s) => String(s.id)}
                  renderItem={({ item }) => (
                    <View style={styles.playlistSongRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={styles.playlistSongTitle}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.playlistSongMeta} numberOfLines={1}>
                          {item.artistName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          confirmRemoveSong(selectedPlaylist.id, item.id)
                        }
                        style={styles.trashButton}
                      >
                        <Icon name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
          ) : (
            <>
              {songToAddTitle ? (
                <View
                  style={{
                    marginBottom: 8,
                    padding: 8,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#cfeeff", fontWeight: "700" }}>
                    Vas a añadir
                  </Text>
                  <Text style={{ color: "#eaf6ff" }} numberOfLines={1}>
                    {songToAddTitle}
                  </Text>
                </View>
              ) : null}
              <FlatList
                data={playlists}
                keyExtractor={(p) => String(p.id)}
                renderItem={({ item }) => (
                  <View style={styles.playlistRowWithActions}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => handleAdd(item.id)}
                    >
                      <Text style={styles.playlistName}>{item.name}</Text>
                      <Text style={styles.playlistDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        onPress={() => openPlaylist(item)}
                        style={styles.iconAction}
                      >
                        <Icon name="list" size={16} color="#9fb4d6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDeletePlaylist(item.id)}
                        style={styles.iconActionDanger}
                      >
                        <Icon name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.empty}>
                    No hay playlists. Crea una nueva abajo.
                  </Text>
                }
              />
            </>
          )}

          {creating ? (
            <View style={styles.createBox}>
              <TextInput
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                placeholder="Descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
              />
              <View style={styles.createActions}>
                <TouchableOpacity
                  onPress={() => setCreating(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreate}
                  style={styles.createButton}
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.createText}>Crear</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => setCreating(true)}
            >
              <Text style={styles.newButtonText}>+ Nueva playlist</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#071428",
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { color: "#eaf6ff", fontSize: 18, fontWeight: "700" },
  close: { color: "#9fb4d6" },
  playlistRow: {
    paddingVertical: 10,
    borderBottomColor: "#133b63",
    borderBottomWidth: 1,
  },
  playlistName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  playlistDesc: { color: "#9fb4d6", fontSize: 12 },
  empty: { color: "#9fb4d6", textAlign: "center", marginVertical: 12 },
  newButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#1DB954",
    borderRadius: 8,
    alignItems: "center",
  },
  newButtonText: { color: "#071428", fontWeight: "700" },
  createBox: { marginTop: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    marginBottom: 8,
  },
  createActions: { flexDirection: "row", justifyContent: "space-between" },
  cancelButton: { padding: 10 },
  cancelText: { color: "#9fb4d6" },
  createButton: { backgroundColor: "#1DB954", padding: 10, borderRadius: 8 },
  createText: { color: "#071428", fontWeight: "700" },
  playlistRowWithActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#133b63",
    borderBottomWidth: 1,
  },
  rowActions: { flexDirection: "row", gap: 8, marginLeft: 8 },
  iconAction: { padding: 8, backgroundColor: "transparent", borderRadius: 8 },
  iconActionDanger: { padding: 8, backgroundColor: "#ff6b6b", borderRadius: 8 },
  playlistDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  playlistTitle: { color: "#eaf6ff", fontWeight: "700", fontSize: 16 },
  playlistMenuOverlay: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  playlistMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  playlistMenuItemText: {
    color: "#9fb4d6",
    fontWeight: "600",
    fontSize: 14,
  },
  playlistSongRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#133b63",
    borderBottomWidth: 1,
  },
  playlistSongTitle: { color: "#fff", fontWeight: "600" },
  playlistSongMeta: { color: "#9fb4d6", fontSize: 12 },
  trashButton: {
    padding: 8,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    marginLeft: 12,
  },
});

export default PlaylistPicker;
