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
import { Theme, useTheme } from "../contexts/ThemeContext";

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
  const { theme, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(theme, isDark), [theme, isDark]);
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
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View style={[styles.container, { backgroundColor: theme.backgroundCard }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Agregar a playlist</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="close-playlist-picker"
            >
              <Text style={[styles.close, { color: theme.textSecondary }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#1DB954" />
          ) : selectedPlaylist ? (
            <View>
              <View style={[styles.playlistDetailHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => setSelectedPlaylist(null)}>
                  <Text style={[styles.close, { color: theme.textSecondary }]}>← Volver</Text>
                </TouchableOpacity>
                <Text style={[styles.playlistTitle, { color: theme.textPrimary }]}>
                  {selectedPlaylist.name}
                </Text>
                <View style={{ position: "relative" }}>
                  <TouchableOpacity
                    onPress={() => setShowPlaylistMenu(!showPlaylistMenu)}
                  >
                    <Icon name="ellipsis-v" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                  {showPlaylistMenu && (
                    <View style={[styles.playlistMenuOverlay, { backgroundColor: theme.backgroundElevated }]}>
                      <TouchableOpacity
                        style={styles.playlistMenuItem}
                        onPress={() => {
                          setShowPlaylistMenu(false);
                          Alert.alert('Configuración', 'Configuración de playlist (próximamente)');
                        }}
                      >
                        <Icon name="cog" size={16} color={theme.textSecondary} />
                        <Text style={[styles.playlistMenuItemText, { color: theme.textSecondary }]}>Configuración</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.playlistMenuItem, { borderTopColor: theme.border, borderTopWidth: 1 }]}
                        onPress={() => {
                          setShowPlaylistMenu(false);
                          confirmDeletePlaylist(selectedPlaylist.id);
                        }}
                      >
                        <Icon name="trash" size={16} color={theme.error} />
                        <Text style={[styles.playlistMenuItemText, { color: theme.error }]}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              {songsLoading ? (
                <ActivityIndicator size="small" color="#1DB954" />
              ) : (
                <FlatList
                  data={playlistSongs}
                  keyExtractor={(s) => String(s.id)}
                  renderItem={({ item }) => (
                    <View style={[styles.playlistSongRow, { borderBottomColor: theme.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.playlistSongTitle, { color: theme.textPrimary }]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={[styles.playlistSongMeta, { color: theme.textSecondary }]} numberOfLines={1}>
                          {item.artistName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          confirmRemoveSong(selectedPlaylist.id, item.id)
                        }
                        style={[styles.trashButton, { backgroundColor: theme.error }]}
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
                  style={[
                    {
                      marginBottom: 8,
                      padding: 8,
                      backgroundColor: theme.backgroundElevated,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Text style={{ color: theme.textSecondary, fontWeight: "700" }}>
                    Vas a añadir
                  </Text>
                  <Text style={{ color: theme.textPrimary }} numberOfLines={1}>
                    {songToAddTitle}
                  </Text>
                </View>
              ) : null}
              <FlatList
                data={playlists}
                keyExtractor={(p) => String(p.id)}
                renderItem={({ item }) => (
                  <View style={[styles.playlistRowWithActions, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => handleAdd(item.id)}
                    >
                      <Text style={[styles.playlistName, { color: theme.textPrimary }]}>{item.name}</Text>
                      <Text style={[styles.playlistDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        onPress={() => openPlaylist(item)}
                        style={styles.iconAction}
                      >
                        <Icon name="list" size={16} color={theme.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => confirmDeletePlaylist(item.id)}
                        style={[styles.iconActionDanger, { backgroundColor: theme.error }]}
                      >
                        <Icon name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={[styles.empty, { color: theme.textSecondary }]}>
                    No hay playlists. Crea una nueva abajo.
                  </Text>
                }
              />
            </>
          )}

          {creating ? (
            <View style={[styles.createBox, { backgroundColor: theme.backgroundElevated }]}>
              <TextInput
                placeholder="Nombre"
                placeholderTextColor={theme.textTertiary}
                value={name}
                onChangeText={setName}
                style={[styles.input, { 
                  backgroundColor: theme.background,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                }]}
              />
              <TextInput
                placeholder="Descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { 
                  backgroundColor: theme.background,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                }]}
                placeholderTextColor={theme.textTertiary}
              />
              <View style={styles.createActions}>
                <TouchableOpacity
                  onPress={() => setCreating(false)}
                  style={[styles.cancelButton, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreate}
                  style={[styles.createButton, { backgroundColor: theme.primary }]}
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[styles.createText, { color: theme.background }]}>Crear</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.newButton, { backgroundColor: theme.primary }]}
              onPress={() => setCreating(true)}
            >
              <Text style={[styles.newButtonText, { color: theme.background }]}>+ Nueva playlist</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: theme.backgroundCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 8,
  },
  title: { color: theme.textPrimary, fontSize: 18, fontWeight: "700" },
  close: { color: theme.textSecondary },
  playlistRow: {
    paddingVertical: 10,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  playlistName: { color: theme.textPrimary, fontSize: 16, fontWeight: "700" },
  playlistDesc: { color: theme.textSecondary, fontSize: 12 },
  empty: { color: theme.textSecondary, textAlign: "center", marginVertical: 12 },
  newButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  newButtonText: { color: theme.background, fontWeight: "700" },
  createBox: { 
    marginTop: 12,
    backgroundColor: theme.backgroundElevated,
    padding: 12,
    borderRadius: 8,
  },
  input: {
    backgroundColor: theme.background,
    padding: 10,
    borderRadius: 8,
    color: theme.textPrimary,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  createActions: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  cancelButton: { 
    padding: 10,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  cancelText: { color: theme.textSecondary },
  createButton: { 
    backgroundColor: theme.primary, 
    padding: 10, 
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  createText: { color: theme.background, fontWeight: "700" },
  playlistRowWithActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  rowActions: { flexDirection: "row", gap: 8, marginLeft: 8 },
  iconAction: { padding: 8, backgroundColor: "transparent", borderRadius: 8 },
  iconActionDanger: { padding: 8, backgroundColor: theme.error, borderRadius: 8 },
  playlistDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 8,
  },
  playlistTitle: { color: theme.textPrimary, fontWeight: "700", fontSize: 16 },
  playlistMenuOverlay: {
    position: "absolute",
    top: 42,
    right: -8,
    width: 180,
    backgroundColor: theme.backgroundElevated,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.border,
    zIndex: 1000,
    shadowColor: theme.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  playlistMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  playlistMenuItemText: {
    color: theme.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  playlistSongRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
  },
  playlistSongTitle: { color: theme.textPrimary, fontWeight: "600" },
  playlistSongMeta: { color: theme.textSecondary, fontSize: 12 },
  trashButton: {
    padding: 8,
    backgroundColor: theme.error,
    borderRadius: 8,
    marginLeft: 12,
  },
});

export default PlaylistPicker;
