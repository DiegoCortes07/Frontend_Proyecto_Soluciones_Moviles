import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Artist from "../../../interfaces/Artist";
import { useTheme } from "../../../contexts/ThemeContext";
import { getImageUrl, logImageError } from "../../../utils/imageHelper";

const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

interface ArtistCardProps {
  artist: Artist | null;
  artistName: string;
  onPress: () => void;
  onLongPress?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  artistName,
  onPress,
  onLongPress,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const getArtistImage = () =>
    getImageUrl(artist?.image || (artist as any)?.imageUrl, defaultAvatar);
  const [imageUri, setImageUri] = React.useState<string>(getArtistImage());

  React.useEffect(() => {
    setImageUri(getArtistImage());
  }, [artist]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            logImageError("ArtistCard", imageUri);
            setImageUri(defaultAvatar);
          }}
          progressiveRenderingEnabled
        />
        <Text style={styles.name} numberOfLines={1}>
          {artistName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    marginRight: 12,
    backgroundColor: theme.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  content: {
    alignItems: "center",
    width: 120,
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.backgroundElevated,
  },
  name: {
    color: theme.textPrimary,
    marginTop: 6,
    maxWidth: 120,
    textAlign: "center",
    fontWeight: "700",
  },
});
