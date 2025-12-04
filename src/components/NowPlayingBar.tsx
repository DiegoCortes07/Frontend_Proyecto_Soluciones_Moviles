import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Slider from "@react-native-community/slider";
import Song from "../interfaces/Song";

interface Props {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek?: (value: number) => void;
  onBarLayout?: (height: number) => void;
  onToggleFavorite?: (song: Song) => void;
  onAddToPlaylist?: (song: Song) => void;
  isFavorited?: boolean;
}

const NowPlayingBar: React.FC<Props> = ({
  song,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onBarLayout,
  onToggleFavorite,
  onAddToPlaylist,
  isFavorited,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [localFavorited, setLocalFavorited] = useState<boolean>(!!isFavorited);

  useEffect(() => {
    setLocalFavorited(!!isFavorited);
  }, [isFavorited]);

  const translateY = useRef(new Animated.Value(0)).current;
  const openAnim = useRef(new Animated.Value(0)).current; // 0 -> closed, 1 -> opened
  const barOpacity = useRef(new Animated.Value(1)).current; // animate small bar opacity
  const barTranslateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          // close via closeModal
          closeModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    // animate bar opacity when expanded changes
    Animated.timing(barOpacity, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(barTranslateY, {
      toValue: expanded ? 120 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();

    if (expanded) {
      // open modal animation
      Animated.spring(openAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // reset translateY and openAnim
      translateY.setValue(0);
      openAnim.setValue(0);
    }
  }, [expanded]);

  const closeModal = () => {
    Animated.timing(openAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      translateY.setValue(0);
      setExpanded(false);
    });
  };

  const renderModal = () => (
    <Modal visible={expanded} animationType="none" onRequestClose={closeModal}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
          <Icon name="close" size={28} color="#eaf6ff" />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                { translateY },
                {
                  scale: openAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }),
                },
              ],
              opacity: openAnim,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {song ? (
            <Image source={{ uri: song.imageUrl }} style={styles.modalCover} />
          ) : (
            <View style={styles.modalCoverPlaceholder} />
          )}

          <Text style={styles.modalTitle} numberOfLines={2}>{song ? song.title : "No song"}</Text>
          <Text style={styles.modalArtist}>{song ? song.artistName : "—"}</Text>

          <View style={styles.modalControls}>
            <TouchableOpacity onPress={onPrev}>
              <Icon name="backward" size={36} color="#eaf6ff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onPlayPause} style={[styles.playButton, isPlaying ? styles.pause : styles.play]}>
              <Icon name={isPlaying ? "pause" : "play"} size={28} color="#071428" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onNext}>
              <Icon name="forward" size={36} color="#eaf6ff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSliderWrap}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Slider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={1}
              value={duration ? currentTime / duration : 0}
              onValueChange={(v) => onSeek && onSeek(v * duration)}
              minimumTrackTintColor="#1DB9FF"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#fff"
            />
            <Text style={[styles.timeText, { textAlign: "right" }]}>{formatTime(duration)}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <Animated.View
      style={[styles.container, { opacity: barOpacity, transform: [{ translateY: barTranslateY }] }]}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (onBarLayout) onBarLayout(h);
      }}
    > 
      <View style={styles.left}>
        {song ? (
          <Image source={{ uri: song.imageUrl }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {song ? song.title : "No song"}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {song ? song.artistName : "—"}
          </Text>
        </View>
      </View>

      <View style={styles.center}>
        <View style={styles.controls}>
          <TouchableOpacity onPress={onPrev} accessibilityLabel="previous">
            <Icon name="backward" size={20} color="#eaf6ff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPlayPause}
            style={[styles.playButton, isPlaying ? styles.pause : styles.play]}
            accessibilityLabel="play-pause"
          >
            <Icon name={isPlaying ? "pause" : "play"} size={18} color="#071428" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext} accessibilityLabel="next">
            <Icon name="forward" size={20} color="#eaf6ff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sliderWrap}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={duration ? currentTime / duration : 0}
            onValueChange={(v) => onSeek && onSeek(v * duration)}
            minimumTrackTintColor="#1DB9FF"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#fff"
          />
          <Text style={[styles.timeText, { textAlign: "right" }]}> {formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => {
              if (!song) return;
              // toggle local state and call parent
              const newVal = !localFavorited;
              setLocalFavorited(newVal);
              onToggleFavorite && onToggleFavorite(song);
            }}
            accessibilityLabel="favorite"
            style={styles.iconButton}
          >
            <Icon name={localFavorited ? "heart" : "heart-o"} size={18} color={localFavorited ? "#ff6b81" : "#eaf6ff"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!song) return;
              onAddToPlaylist && onAddToPlaylist(song);
            }}
            accessibilityLabel="add-to-playlist"
            style={styles.iconButton}
          >
            <Icon name="plus" size={16} color="#eaf6ff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setExpanded(true)} accessibilityLabel="expand" style={styles.iconButton}>
            <Icon name="arrows-alt" size={16} color="#eaf6ff" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && renderModal()}
    </Animated.View>
  );
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    backgroundColor: "#071428",
    borderTopColor: "#133b63",
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    width: 220,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: "#0e3a57",
  },
  meta: {
    marginLeft: 10,
    maxWidth: 140,
  },
  title: {
    color: "#eaf6ff",
    fontWeight: "700",
  },
  artist: {
    color: "#9fd6ff",
    fontSize: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  playButton: {
    marginHorizontal: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  play: {
    backgroundColor: "#1DB9FF",
  },
  pause: {
    backgroundColor: "#ff6b6b",
  },
  sliderWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  timeText: {
    color: "#9fd6ff",
    fontSize: 12,
    width: 40,
  },
  slider: {
    flex: 1,
    height: 30,
  },
  right: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 96,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#071428",
  },
  modalClose: {
    marginTop: 40,
    marginLeft: 16,
  },
  modalContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  modalCover: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").width * 0.8,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  modalCoverPlaceholder: {
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").width * 0.8,
    borderRadius: 8,
    backgroundColor: "#0e3a57",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#eaf6ff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  modalArtist: {
    color: "#9fd6ff",
    fontSize: 16,
    marginBottom: 20,
  },
  modalControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 18,
    marginTop: 14,
  },
  modalSliderWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
});

export default NowPlayingBar;
