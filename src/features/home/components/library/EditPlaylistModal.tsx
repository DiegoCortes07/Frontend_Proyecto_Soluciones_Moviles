import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";

// Declarar window para TypeScript en web
declare const window: any;

interface EditPlaylistModalProps {
  visible: boolean;
  playlistId: number;
  currentName: string;
  currentDescription: string;
  currentImage: string | null;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  onUploadImage: (imageFile: any) => Promise<void>;
}

export const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  visible,
  playlistId,
  currentName,
  currentDescription,
  currentImage,
  onClose,
  onSave,
  onUploadImage,
}) => {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [imageUri, setImageUri] = useState<string | null>(currentImage);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setName(currentName);
    setDescription(currentDescription);
    setImageUri(currentImage);
  }, [currentName, currentDescription, currentImage, visible]);

  const pickImage = async () => {
    try {
      console.log("Requesting media library permissions...");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", status);
      
      if (status !== "granted") {
        console.warn("Permission denied for media library");
        if (Platform.OS === "web") {
          window.alert("Se necesitan permisos para acceder a la galería");
        } else {
          Alert.alert("Permisos requeridos", "Se necesitan permisos para acceder a la galería");
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImageUri(selectedImage.uri);
        
        // Validar tamaño de imagen (máx 5MB)
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB
        if (selectedImage.fileSize && selectedImage.fileSize > maxSizeBytes) {
          if (Platform.OS === "web") {
            window.alert("La imagen es demasiado grande. Máximo 5MB.");
          } else {
            Alert.alert("Error", "La imagen es demasiado grande. Máximo 5MB.");
          }
          return;
        }
        if (!selectedImage.fileName?.includes(".jpeg")) {
          if (Platform.OS === "web") {
            window.alert("La imagen debe ser en formato JPEG.");
          } else {
            Alert.alert("Error", "La imagen debe ser en formato JPEG.");
          }
          return;
        }
        
        // Preparar el archivo para upload
        const imageFile = {
          uri: selectedImage.uri,
          name: `playlist_${playlistId}_${Date.now()}.jpg`,
          type: "image/jpeg",
        };

        setLoading(true);
        try {
          await onUploadImage(imageFile);
          console.log("Image uploaded successfully");
          if (Platform.OS === "web") {
            window.alert("Imagen subida exitosamente");
          } else {
            Alert.alert("Éxito", "Imagen subida correctamente");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          const errorMessage = (error as any)?.message || "Error al subir la imagen";
          if (Platform.OS === "web") {
            window.alert(errorMessage);
          } else {
            Alert.alert("Error", errorMessage);
          }
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      const errorMessage = (error as any)?.message || "Error al seleccionar la imagen";
      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      if (Platform.OS === "web") {
        window.alert("El nombre de la playlist es requerido");
      } else {
        Alert.alert("Error", "El nombre de la playlist es requerido");
      }
      return;
    }

    setLoading(true);
    try {
      await onSave(name.trim(), description.trim());
      onClose();
    } catch (error) {
      console.error("Error saving playlist:", error);
      if (Platform.OS === "web") {
        window.alert("Error al guardar los cambios");
      } else {
        Alert.alert("Error", "No se pudieron guardar los cambios");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Playlist</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="times" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.playlistImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Icon name="music" size={40} color="#9fb4d6" />
                </View>
              )}
              <View style={styles.imageOverlay}>
                <Icon name="camera" size={24} color="#fff" />
                <Text style={styles.changeImageText}>Cambiar imagen</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre de la playlist"
              placeholderTextColor="#9fb4d6"
              maxLength={100}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción (opcional)"
              placeholderTextColor="#9fb4d6"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#031427" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: "#0b1630",
    borderRadius: 18,
    padding: 20,
    width: "90%",
    maxWidth: 500,
    borderWidth: 1,
    borderColor: "#1c2f55",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f4f8ff",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageContainer: {
    position: "relative",
    width: 180,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
  },
  playlistImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0c1730",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1c2f55",
    borderRadius: 12,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#dfe8ff",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#0c1730",
    borderWidth: 1,
    borderColor: "#1c2f55",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#f4f8ff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#1c2f55",
  },
  cancelButtonText: {
    color: "#9fb4d6",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#1DB954",
  },
  saveButtonText: {
    color: "#031427",
    fontSize: 16,
    fontWeight: "800",
  },
});
