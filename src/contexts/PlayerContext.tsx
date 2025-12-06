import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAudioPlayer } from "expo-audio";
import Song from "../interfaces/Song";
import { likeSong, getLikedSongs } from "../../api/like";
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadLikedSongs = async () => {
      if (!token) {
        setLikedSongsSet(new Set());
        return;
      }
      try {
        const songs = await getLikedSongs(token);
        const ids = new Set<number>(songs.map((song: Song) => song.id).filter((id: number | undefined): id is number => id !== undefined));
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

  const playSong = async (s: Song) => {
    setSong(s);
    try {
      await player.replace(s.cloudinarySecureUrl);
      await player.seekTo(0);
      await player.play();
      setIsPlaying(true);
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
    try {
      await likeSong(token, s.id);
      // Update local set optimistically
      setLikedSongsSet(prev => {
        const newSet = new Set(prev);
        if (newSet.has(s.id)) {
          newSet.delete(s.id);
        } else {
          newSet.add(s.id);
        }
        return newSet;
      });
    } catch (e) {
      console.error("Toggle favorite error:", e);
    }
  };

  const addToPlaylist = (s: Song) => {
    // placeholder
    console.log("addToPlaylist", s.id);
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
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export default PlayerContext;
