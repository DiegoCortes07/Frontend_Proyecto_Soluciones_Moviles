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
  ScrollView,
  Platform,
  ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../contexts/ThemeContext";
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
  style?: ViewStyle;
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
  style,
}) => {
  const { width: screenW } = Dimensions.get("window");
  const isMobile = screenW < 640;
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);
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

  const renderModal = () => {
    const win = Dimensions.get("window");
    const isSmallScreen = win.height < 700;
    const coverSize = isSmallScreen 
      ? Math.min(win.width * 0.72, win.height * 0.35)
      : Math.min(win.width * 0.84, win.height * 0.42);

    return (
      <Modal visible={expanded} animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalTopBar}>
            <TouchableOpacity style={styles.topIconButton} onPress={closeModal}>
              <Icon name="chevron-down" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={styles.modalTopCenter}>
              <Text style={styles.topLabel}>Reproduciendo</Text>
              <Text style={styles.topSubLabel}>Tu biblioteca</Text>
            </View>
            <View style={styles.topSpacer} />
          </View>

          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  { translateY },
                  {
                    scale: openAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }),
                  },
                ],
                opacity: openAnim,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.modalMain, isSmallScreen && styles.modalMainCompact]}>
              <View style={[styles.coverFrame, localFavorited && styles.coverFrameLiked]}>
                {song ? (
                  <Image source={{ uri: song.imageUrl }} style={[styles.modalCover, { width: coverSize, height: coverSize }]} />
                ) : (
                  <View style={[styles.modalCoverPlaceholder, { width: coverSize, height: coverSize }]} />
                )}
              </View>

              <View style={styles.modalMeta}>
                <View style={styles.metaRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle} numberOfLines={2}>{song ? song.title : "No song"}</Text>
                    <Text style={styles.modalArtist}>{song ? song.artistName : "—"}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (!song) return;
                      const nextVal = !localFavorited;
                      setLocalFavorited(nextVal);
                      onToggleFavorite && onToggleFavorite(song);
                    }}
                    style={styles.inlineIconButton}
                    accessibilityLabel="favorite-expanded"
                  >
                    <Icon name={localFavorited ? "heart" : "heart-o"} size={24} color={localFavorited ? theme.success : theme.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSliderWrap}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Slider
                  style={{ flex: 1 }}
                  minimumValue={0}
                  maximumValue={1}
                  value={duration ? currentTime / duration : 0}
                  onValueChange={(v) => onSeek && onSeek(v * duration)}
                  minimumTrackTintColor="#1DB954"
                  maximumTrackTintColor="#264366"
                  thumbTintColor="#fff"
                />
                <Text style={[styles.timeText, { textAlign: "right" }]}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.modalControlsLarge}>
                <TouchableOpacity onPress={onPrev}>
                  <Icon name="backward" size={34} color={theme.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity onPress={onPlayPause} style={[styles.playButtonLarge, isPlaying ? styles.pause : styles.play]}>
                  <Icon name={isPlaying ? "pause" : "play"} size={32} color={theme ? "#071428" : "#ffffff"} />
                </TouchableOpacity>

                <TouchableOpacity onPress={onNext}>
                  <Icon name="forward" size={34} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  onPress={() => { if (song) onAddToPlaylist && onAddToPlaylist(song); }}
                  style={styles.modalIconButton}
                >
                  <Icon name="plus" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const fallbackCover = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";

  return (
    <Animated.View
      style={[
        styles.container,
        isMobile && styles.containerMobile,
        { opacity: barOpacity, transform: [{ translateY: barTranslateY }] },
        style,
      ]}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (onBarLayout) onBarLayout(h);
      }}
    > 
      {isMobile ? (
        <TouchableOpacity 
          style={{ flex: 1, width: '100%' }} 
          onPress={() => setExpanded(true)}
          activeOpacity={0.8}
        >
          <View style={styles.mobileTopRow}>
            <View style={styles.leftMobile}>
              {song ? (
                <Image source={{ uri: song.imageUrl || fallbackCover }} style={styles.coverMobile} resizeMode="cover" />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}
              <View style={styles.metaMobile}>
                <Text style={styles.title} numberOfLines={1}>
                  {song ? song.title : "No song"}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {song ? song.artistName : "—"}
                </Text>
              </View>
            </View>
            <View style={styles.mobileActions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  if (!song) return;
                  const newVal = !localFavorited;
                  setLocalFavorited(newVal);
                  onToggleFavorite && onToggleFavorite(song);
                }}
                accessibilityLabel="favorite"
                style={styles.iconButton}
              >
                <Icon name={localFavorited ? "heart" : "heart-o"} size={18} color={localFavorited ? theme.liked : theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mobileControls}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onPrev(); }} accessibilityLabel="previous">
              <Icon name="backward" size={24} color={theme.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onPlayPause(); }}
              style={[styles.playButton, isPlaying ? styles.pause : styles.play]}
              accessibilityLabel="play-pause"
            >
              <Icon name={isPlaying ? "pause" : "play"} size={22} color={isDark ? "#071428" : "#ffffff"} />
            </TouchableOpacity>

            <TouchableOpacity onPress={(e) => { e.stopPropagation(); onNext(); }} accessibilityLabel="next">
              <Icon name="forward" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.mobileTimeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeSeparator}>/</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} 
          onPress={() => setExpanded(true)}
          activeOpacity={0.8}
        >
          <View style={styles.left}>
            {song ? (
              <Image source={{ uri: song.imageUrl || fallbackCover }} style={styles.cover} resizeMode="cover" />
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
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); onPrev(); }} accessibilityLabel="previous">
                <Icon name="backward" size={20} color={theme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(e) => { e.stopPropagation(); onPlayPause(); }}
                style={[styles.playButton, isPlaying ? styles.pause : styles.play]}
                accessibilityLabel="play-pause"
              >
                <Icon name={isPlaying ? "pause" : "play"} size={18} color={isDark ? "#071428" : "#ffffff"} />
              </TouchableOpacity>

              <TouchableOpacity onPress={(e) => { e.stopPropagation(); onNext(); }} accessibilityLabel="next">
                <Icon name="forward" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeSeparator}>/</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.right}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  if (!song) return;
                  const newVal = !localFavorited;
                  setLocalFavorited(newVal);
                  onToggleFavorite && onToggleFavorite(song);
                }}
                accessibilityLabel="favorite"
                style={styles.iconButton}
              >
                <Icon name={localFavorited ? "heart" : "heart-o"} size={18} color={localFavorited ? theme.liked : theme.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  if (!song) return;
                  onAddToPlaylist && onAddToPlaylist(song);
                }}
                accessibilityLabel="add-to-playlist"
                style={styles.iconButton}
              >
                <Icon name="plus" size={16} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "ios" ? 20 : 10,
    height: 90,
    backgroundColor: theme.backgroundSecondary,
    borderTopColor: theme.border,
    borderTopWidth: 1,
    borderRadius: 16,
    marginHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  containerMobile: {
    height: 125,
    flexDirection: "column",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    bottom: Platform.OS === "ios" ? 25 : 15,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    width: 200,
    minWidth: 120,
  },
  leftMobile: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  cover: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },
  coverMobile: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: theme.backgroundElevated,
  },
  coverPlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 8,
    backgroundColor: theme.backgroundElevated,
  },
  meta: {
    marginLeft: 8,
    maxWidth: 100,
    flex: 1,
  },
  metaMobile: {
    flex: 1,
  },
  title: {
    color: theme.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  artist: {
    color: theme.textTertiary,
    fontSize: 13,
  },
  mobileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  mobileActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  play: {
    backgroundColor: theme.primary,
  },
  pause: {
    backgroundColor: theme.error,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  mobileTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  timeText: {
    color: theme.textTertiary,
    fontSize: 13,
    fontWeight: "600",
  },
  timeSeparator: {
    color: theme.textTertiary,
    fontSize: 13,
    fontWeight: "400",
  },
  right: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
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
    backgroundColor: theme.background,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 10,
  },
  topIconButton: {
    padding: 8,
    borderRadius: 18,
    backgroundColor: theme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  },
  modalTopCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  topLabel: {
    color: theme.textTertiary,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  topSubLabel: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  topSpacer: {
    width: 36,
  },
  modalContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
    flexGrow: 1,
  },
  modalMain: {
    width: '100%',
    alignItems: 'center',
    gap: 18,
  },
  modalMainCompact: {
    gap: 12,
  },
  modalMeta: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  inlineIconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  coverFrame: {
    borderWidth: 2,
    borderColor: theme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    padding: 8,
  },
  coverFrameLiked: {
    borderColor: '#1DB954',
    shadowColor: '#1DB954',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalCover: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  modalCoverPlaceholder: {
    borderRadius: 12,
    backgroundColor: theme.backgroundElevated,
  },
  modalTitle: {
    color: theme.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "left",
  },
  modalArtist: {
    color: theme.textTertiary,
    fontSize: 16,
    textAlign: "left",
  },
  modalControlsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
    marginTop: 8,
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 12,
  },
  modalIconButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: theme ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)'
  },
  modalSliderWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
});

export default NowPlayingBar;
