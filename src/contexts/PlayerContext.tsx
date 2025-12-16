import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAudioPlayer } from "expo-audio";
import Song from "../interfaces/Song";
import { likeSong, getLikedSongs } from "../../api/like";
import { createPlaylist, addSongToPlaylist, fetchUserPlaylists, removeSongFromPlaylist, deletePlaylist } from "../../api/playlist";
import { useAuth } from "./AuthContext";

type PlayerContextType = {
  token?: string | null;
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playlist: Song[];
  likedSongsSet: Set<number>;
  setPlaylist: (list: Song[]) => void;
  playQueue: (songs: Song[], startIndex?: number) => Promise<void>;
  playSong: (s: Song) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  prev: () => Promise<void>;
  next: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  toggleFavorite: (s: Song) => void;
  addToPlaylist: (s: Song) => void;
  isFavorited: (songId: number) => boolean;
  stopAndCleanup: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const player = useAudioPlayer();
  const [song, setSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playlist, setPlaylistState] = useState<Song[]>([]);
  const [likedSongsSet, setLikedSongsSet] = useState<Set<number>>(new Set());
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<number | null>(null);

  useEffect(() => {
    const loadLikedSongs = async () => {
      if (!token) {
        setLikedSongsSet(new Set());
        return;
      }
      try {
        const songs = await getLikedSongs(token);
        const list = Array.isArray(songs) ? songs : [];
        const ids = new Set<number>(list.map((song: Song) => song.id).filter((id: number | undefined): id is number => id !== undefined));
        setLikedSongsSet(ids);
      } catch (e) {
        console.error("Error loading liked songs:", e);
        setLikedSongsSet(new Set());
      }
    };
    loadLikedSongs();
  }, [token]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(player.currentTime || 0);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, player.currentTime]);

  const setPlaylist = (list: Song[]) => setPlaylistState(list || []);

  const playQueue = async (songs: Song[], startIndex: number = 0) => {
    if (!songs || songs.length === 0) return;
    setPlaylistState(songs);
    const idx = Math.min(Math.max(startIndex, 0), songs.length - 1);
    await playSong(songs[idx]);
  };

  const playSong = async (s: Song) => {
    try {
      if (song?.id === s.id) {
        await player.play();
        setIsPlaying(true);
        return;
      }
      await player.replace(s.cloudinarySecureUrl);
      await player.seekTo(0);
      await player.play();
      setSong(s);
      setIsPlaying(true);
      autoAdvanceRef.current = null;
    } catch (e) {
      console.error("Player error:", e);
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
    } catch (e) {
      console.error("Toggle play error:", e);
    }
  };

  const prev = async () => {
    if (!song || playlist.length === 0) return;
    const idx = playlist.findIndex((x) => x.id === song.id);
    const newIdx = idx > 0 ? idx - 1 : playlist.length - 1;
    await playSong(playlist[newIdx]);
  };

  const next = async () => {
    if (!song || playlist.length === 0) return;
    const idx = playlist.findIndex((x) => x.id === song.id);
    const newIdx = idx < playlist.length - 1 ? idx + 1 : 0;
    await playSong(playlist[newIdx]);
  };

  useEffect(() => {
    const duration = player.duration || 0;
    if (!song || !isPlaying || duration <= 0) return;

    const remaining = duration - currentTime;
    if (remaining <= 0.75) {
      if (autoAdvanceRef.current !== song.id) {
        autoAdvanceRef.current = song.id ?? null;
        next();
      }
    } else {
      // Reset guard when we're safely away from the end (e.g., after seeking back)
      autoAdvanceRef.current = null;
    }
  }, [currentTime, isPlaying, song, player.duration, next]);

  const seek = async (time: number) => {
    setCurrentTime(time);
    try {
      await player.seekTo(time);
    } catch (e) {
      console.error("Seek error:", e);
    }
  };

  const toggleFavorite = async (s: Song) => {
    if (!token) {
      console.warn("No token available for like action");
      return;
    }
    if(!s.id) {
      console.warn("Song has no ID, cannot like");
      return;
    }
    const wasFavorited = likedSongsSet.has(s.id);

    setLikedSongsSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(s.id)) {
        newSet.delete(s.id);
      } else {
        newSet.add(s.id);
      }
      return newSet;
    });
    try {
      await likeSong(token, s.id);
    } catch (e) {
      console.error("Toggle favorite error:", e); 
      setLikedSongsSet(prev => {
        const newSet = new Set(prev);
        if (wasFavorited) {
          newSet.add(s.id!);
        } else {
          newSet.delete(s.id!);
        }
        return newSet;
      });
    }
  };

  const addToPlaylist = (s: Song) => {
    setSongToAdd(s);
  };

  useEffect(() => {
    if (songToAdd) {
      // open picker after songToAdd is set
      setPickerVisible(true);
    }
  }, [songToAdd]);

  const closePicker = () => {
    setPickerVisible(false);
    setSongToAdd(null);
  };

  const loadPlaylists = async () => {
    if (!token) return;
    try {
      setLoadingPlaylists(true);
      const list = await fetchUserPlaylists(token);
      setPlaylists(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Error loading playlists:", e);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleCreatePlaylist = async (name: string, description?: string) => {
    if (!token) throw new Error("No token");
    const created = await createPlaylist(token, name, description || "");
    // refresh playlists list
    await loadPlaylists();
    return created;
  };

  const handleAddSongToPlaylist = async (playlistId: number, songId?: number) => {
    console.log('handleAddSongToPlaylist called', { tokenPresent: !!token, playlistId, songId, songToAddId: songToAdd?.id });
    if (!token) throw new Error("Missing token");
    const idToAdd = songId ?? songToAdd?.id;
    if (!idToAdd) throw new Error("Missing song id");
    try {
      const res = await addSongToPlaylist(token, playlistId, idToAdd);
      // optionally refresh playlists (depending on API)
      await loadPlaylists();
      closePicker();
      return res;
    } catch (e) {
      console.error('Error in handleAddSongToPlaylist API call:', e);
      throw e;
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    console.log("handleDeletePlaylist called", { tokenPresent: !!token, playlistId });
    if (!token) {
      console.warn("Cannot delete playlist: no token");
      throw new Error("No token");
    }
    try {
      const res = await deletePlaylist(token, playlistId);
      await loadPlaylists();
      return res;
    } catch (e) {
      console.error("Error in handleDeletePlaylist API call:", e);
      throw e;
    }
  };

  const handleRemoveSongFromPlaylist = async (playlistId: number, songId: number) => {
    console.log("handleRemoveSongFromPlaylist called", { tokenPresent: !!token, playlistId, songId });
    if (!token) {
      console.warn("Cannot remove song: no token");
      throw new Error("No token");
    }
    try {
      const res = await removeSongFromPlaylist(token, playlistId, songId);
      await loadPlaylists();
      return res;
    } catch (e) {
      console.error("Error in handleRemoveSongFromPlaylist API call:", e);
      throw e;
    }
  };

  const isFavorited = (songId: number): boolean => {
    return likedSongsSet.has(songId);
  };

  const stopAndCleanup = async () => {
    try {
      await player.pause();
      setIsPlaying(false);
      setSong(null);
      setCurrentTime(0);
      setPlaylistState([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (e) {
      console.error("Error stopping player:", e);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        song,
        isPlaying,
        currentTime,
        duration: player.duration || 0,
        playlist,
        likedSongsSet,
        token,
        setPlaylist,
        playQueue,
        playSong,
        togglePlayPause,
        prev,
        next,
        seek,
        toggleFavorite,
        addToPlaylist,
        isFavorited,
        stopAndCleanup,
      }}
    >
      {children}
      {pickerVisible ? (() => {
        const Picker = require("../components/PlaylistPicker").default;
        return (
            <Picker
              visible={pickerVisible}
              playlists={playlists}
              loading={loadingPlaylists}
              onClose={closePicker}
              onRefresh={loadPlaylists}
              onCreate={handleCreatePlaylist}
              onAddSong={handleAddSongToPlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveSong={handleRemoveSongFromPlaylist}
              songToAddId={songToAdd?.id}
              songToAddTitle={songToAdd?.title}
            />
        );
      })() : null}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export default PlayerContext;
