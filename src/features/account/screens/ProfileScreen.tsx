import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import AppLayout from "../../../components/layout/AppLayout";
import Icon from "react-native-vector-icons/FontAwesome";
import { changePassword, changeUserData, changeUserImage } from "../../../../api/user";
import * as ImagePicker from 'expo-image-picker';

declare const window: any;

const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

export default function ProfileScreen() {
  const auth = useAuth();
  const { theme } = useTheme();
  const user = auth.user;
  const styles = getStyles(theme);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [isSavingData, setIsSavingData] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      if (Platform.OS === "web") {
        window.alert("Por favor completa todos los campos");
      } else {
        Alert.alert("Error", "Por favor completa todos los campos");
      }
      return;
    }

    if (newPassword.length < 6) {
      if (Platform.OS === "web") {
        window.alert("La contraseña debe tener al menos 6 caracteres");
      } else {
        Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      if (Platform.OS === "web") {
        window.alert("Las contraseñas no coinciden");
      } else {
        Alert.alert("Error", "Las contraseñas no coinciden");
      }
      return;
    }

    setIsChanging(true);
    try {
      await changePassword(auth.token, newPassword);
      
      if (Platform.OS === "web") {
        window.alert("Contraseña cambiada exitosamente");
      } else {
        Alert.alert("Éxito", "Contraseña cambiada exitosamente");
      }
      
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      if (Platform.OS === "web") {
        window.alert("Error al cambiar la contraseña");
      } else {
        Alert.alert("Error", "No se pudo cambiar la contraseña");
      }
    } finally {
      setIsChanging(false);
    }
  };

  const handleChangeProfilePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        if (Platform.OS === "web") {
          window.alert("Necesitas dar permisos para acceder a la galería");
        } else {
          Alert.alert("Permisos", "Necesitas dar permisos para acceder a la galería");
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
        setIsUploadingPhoto(true);
        const imageUri = result.assets[0].uri;

        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);

        await changeUserImage(auth.token, formData);
        await auth.refreshUser();

        if (Platform.OS === "web") {
          window.alert("Foto de perfil actualizada exitosamente");
        } else {
          Alert.alert("Éxito", "Foto de perfil actualizada exitosamente");
        }
      }
    } catch (error) {
      console.error("Error changing profile photo:", error);
      if (Platform.OS === "web") {
        window.alert("Error al cambiar la foto de perfil");
      } else {
        Alert.alert("Error", "No se pudo cambiar la foto de perfil");
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveUserData = async () => {
    if (!editUsername.trim() || !editEmail.trim()) {
      if (Platform.OS === "web") {
        window.alert("Por favor completa todos los campos");
      } else {
        Alert.alert("Error", "Por favor completa todos los campos");
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      if (Platform.OS === "web") {
        window.alert("Por favor ingresa un correo electrónico válido");
      } else {
        Alert.alert("Error", "Por favor ingresa un correo electrónico válido");
      }
      return;
    }

    setIsSavingData(true);
    try {
      await changeUserData(auth.token, {
        newUsername: editUsername,
        newEmail: editEmail,
      });
      
      await auth.refreshUser();

      if (Platform.OS === "web") {
        window.alert("Datos actualizados exitosamente");
      } else {
        Alert.alert("Éxito", "Datos actualizados exitosamente");
      }
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating user data:", error);
      if (Platform.OS === "web") {
        window.alert("Error al actualizar los datos");
      } else {
        Alert.alert("Error", "No se pudieron actualizar los datos");
      }
    } finally {
      setIsSavingData(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <View style={styles.container}>
          <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout userName={user.username}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Mi Perfil</Text>
          
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: user.urlProfilePhoto || defaultAvatar }}
                style={styles.profileImage}
              />
              <TouchableOpacity 
                style={styles.editPhotoButton}
                onPress={handleChangeProfilePhoto}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <ActivityIndicator size="small" color="#071428" />
                ) : (
                  <Icon name="camera" size={18} color="#071428" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <View style={styles.infoRowHeader}>
                  <Text style={styles.label}>Nombre de usuario:</Text>
                  <TouchableOpacity onPress={() => {
                    setEditUsername(user.username);
                    setEditEmail(user.email);
                    setShowEditModal(true);
                  }}>
                    <Icon name="edit" size={16} color="#1DB954" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.value}>{user.username}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoRowHeader}>
                  <Text style={styles.label}>Correo electrónico:</Text>
                  <TouchableOpacity onPress={() => {
                    setEditUsername(user.username);
                    setEditEmail(user.email);
                    setShowEditModal(true);
                  }}>
                    <Icon name="edit" size={16} color="#1DB954" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.value}>{user.email}</Text>
              </View>

              <TouchableOpacity 
                style={styles.changePasswordButton}
                onPress={() => setShowPasswordModal(true)}
              >
                <Icon name="lock" size={16} color="#071428" style={styles.buttonIcon} />
                <Text style={styles.changePasswordButtonText}>Cambiar contraseña</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Modal de cambio de contraseña */}
        <Modal
          visible={showPasswordModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <Icon name="times" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nueva contraseña</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={theme.textTertiary}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Icon name={showNewPassword ? "eye" : "eye-slash"} size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Repite la contraseña"
                      placeholderTextColor={theme.textTertiary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon name={showConfirmPassword ? "eye" : "eye-slash"} size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowPasswordModal(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    disabled={isChanging}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleChangePassword}
                    disabled={isChanging}
                  >
                    {isChanging ? (
                      <ActivityIndicator size="small" color="#071428" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Cambiar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de edición de datos */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Perfil</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Icon name="times" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nombre de usuario</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu nombre de usuario"
                    placeholderTextColor={theme.textTertiary}
                    value={editUsername}
                    onChangeText={setEditUsername}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Correo electrónico</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu correo"
                    placeholderTextColor={theme.textTertiary}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowEditModal(false);
                      setEditUsername(user.username);
                      setEditEmail(user.email);
                    }}
                    disabled={isSavingData}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleSaveUserData}
                    disabled={isSavingData}
                  >
                    {isSavingData ? (
                      <ActivityIndicator size="small" color="#071428" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AppLayout>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 24,
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#1DB9FF",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1DB954",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.backgroundSecondary,
    shadowColor: theme.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  infoContainer: {
    width: "100%",
    maxWidth: 500,
  },
  infoRow: {
    backgroundColor: theme.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: theme.textTertiary,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: theme.textPrimary,
    fontWeight: "500",
  },
  changePasswordButton: {
    backgroundColor: "#1DB954",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: theme.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#071428",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.textTertiary,
    marginBottom: 8,
    fontWeight: "600",
  },
  passwordInputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: theme.backgroundCard,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.textPrimary,
    paddingRight: 45,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 14,
    padding: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: theme.backgroundElevated,
    borderWidth: 2,
    borderColor: theme.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  confirmButton: {
    backgroundColor: "#1DB954",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#071428",
  },
  errorText: {
    color: theme.error,
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
});
