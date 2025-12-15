import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme as useThemeContext } from "../../../contexts/ThemeContext";
import AppLayout from "../../../components/layout/AppLayout";
import Icon from "react-native-vector-icons/FontAwesome";
import { changeConfig } from "../../../../api/user";

declare const window: any;

export default function SettingsScreen() {
  const auth = useAuth();
  const { theme: currentTheme } = useThemeContext();
  const user = auth.user;
  
  const [theme, setTheme] = useState(user?.theme || "dark");
  const styles = getStyles(currentTheme);
  const [explicitContent, setExplicitContent] = useState(user?.explicitContent || false);
  const [language, setLanguage] = useState(user?.language || "es");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setTheme(user.theme || "dark");
      setExplicitContent(user.explicitContent || false);
      setLanguage(user.language || "es");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const changed = 
        theme !== user.theme ||
        explicitContent !== user.explicitContent ||
        language !== user.language;
      setHasChanges(changed);
    }
  }, [theme, explicitContent, language, user]);

  const handleSave = async () => {
    if (!user || !auth.token) return;

    setIsSaving(true);
    try {
      const configUpdates = {
        theme,
        language,
        explicitContent,
      };

      await changeConfig(user.id, configUpdates);

      // Refrescar el usuario desde el servidor
      await auth.refreshUser();

      setHasChanges(false);

      if (Platform.OS === "web") {
        window.alert("Configuración guardada correctamente");
      } else {
        Alert.alert("Éxito", "Configuración guardada correctamente");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      if (Platform.OS === "web") {
        window.alert("Error al guardar la configuración");
      } else {
        Alert.alert("Error", "No se pudo guardar la configuración");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setTheme(user.theme || "dark");
      setExplicitContent(user.explicitContent || false);
      setLanguage(user.language || "es");
      setHasChanges(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <View style={styles.container}>
          <Text style={styles.errorText}>No se pudo cargar la configuración</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout userName={user.username}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Ajustes</Text>
          
          <View style={styles.settingsSection}>
            {/* Tema */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Icon name="paint-brush" size={20} color="#1DB9FF" style={styles.icon} />
                <Text style={styles.settingLabel}>Tema</Text>
              </View>
              <View style={styles.settingContent}>
                <View style={styles.themeOptions}>
                  <TouchableOpacity
                    style={[styles.themeOption, theme === "dark" && styles.themeOptionActive]}
                    onPress={() => setTheme("dark")}
                  >
                    <Icon name="moon-o" size={16} color={theme === "dark" ? "#071428" : "#f4f8ff"} />
                    <Text style={[styles.themeOptionText, theme === "dark" && styles.themeOptionTextActive]}>
                      Oscuro
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.themeOption, theme === "light" && styles.themeOptionActive]}
                    onPress={() => setTheme("light")}
                  >
                    <Icon name="sun-o" size={16} color={theme === "light" ? "#071428" : "#f4f8ff"} />
                    <Text style={[styles.themeOptionText, theme === "light" && styles.themeOptionTextActive]}>
                      Claro
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Contenido Explícito */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Icon name="exclamation-triangle" size={20} color="#1DB9FF" style={styles.icon} />
                <Text style={styles.settingLabel}>Contenido explícito</Text>
              </View>
              <View style={styles.settingContent}>
                <Switch
                  value={explicitContent}
                  onValueChange={setExplicitContent}
                  trackColor={{ false: "#3d4f6b", true: "#1DB9FF" }}
                  thumbColor={explicitContent ? "#f4f8ff" : "#8ba3c7"}
                />
                <Text style={styles.settingValue}>
                  {explicitContent ? "Permitido" : "Bloqueado"}
                </Text>
              </View>
            </View>

            {/* Idioma */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Icon name="language" size={20} color="#1DB9FF" style={styles.icon} />
                <Text style={styles.settingLabel}>Idioma</Text>
              </View>
              <View style={styles.settingContent}>
                <View style={styles.languageOptions}>
                  <TouchableOpacity
                    style={[styles.languageOption, language === "es" && styles.languageOptionActive]}
                    onPress={() => setLanguage("es")}
                  >
                    <Text style={[styles.languageOptionText, language === "es" && styles.languageOptionTextActive]}>
                      Español
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.languageOption, language === "en" && styles.languageOptionActive]}
                    onPress={() => setLanguage("en")}
                  >
                    <Text style={[styles.languageOptionText, language === "en" && styles.languageOptionTextActive]}>
                      English
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Plan */}
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Icon name="star" size={20} color="#1DB9FF" style={styles.icon} />
                <Text style={styles.settingLabel}>Plan de suscripción</Text>
              </View>
              <View style={styles.settingContent}>
                <View style={styles.planBadge}>
                  <Text style={styles.planText}>{user.plan}</Text>
                </View>
              </View>
              <Text style={styles.planNote}>El plan no se puede modificar desde aquí</Text>
            </View>
          </View>

          {/* Botones de acción */}
          {hasChanges && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleReset}
                disabled={isSaving}
              >
                <Icon name="undo" size={16} color="#f4f8ff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#071428" />
                ) : (
                  <>
                    <Icon name="save" size={16} color="#071428" style={styles.buttonIcon} />
                    <Text style={[styles.buttonText, styles.saveButtonText]}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!hasChanges && (
            <View style={styles.infoBox}>
              <Icon name="check-circle" size={18} color="#1DB9FF" style={styles.infoIcon} />
              <Text style={styles.infoText}>
                Tu configuración está actualizada
              </Text>
            </View>
          )}
        </View>
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
  settingsSection: {
    width: "100%",
  },
  settingItem: {
    backgroundColor: theme.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.textTertiary,
    fontWeight: "600",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 32,
  },
  settingValue: {
    fontSize: 16,
    color: theme.textPrimary,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  themeOptions: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.backgroundElevated,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.borderLight,
    gap: 6,
  },
  themeOptionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  themeOptionText: {
    fontSize: 14,
    color: theme.textPrimary,
    fontWeight: "600",
  },
  themeOptionTextActive: {
    color: "#071428",
  },
  languageOptions: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  languageOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.backgroundElevated,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.borderLight,
  },
  languageOptionActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  languageOptionText: {
    fontSize: 14,
    color: theme.textPrimary,
    fontWeight: "600",
  },
  languageOptionTextActive: {
    color: "#071428",
  },
  planBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  planText: {
    color: "#071428",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
  planNote: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 8,
    marginLeft: 32,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: theme.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: theme.backgroundElevated,
  },
  saveButton: {
    backgroundColor: theme.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  saveButtonText: {
    color: "#071428",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.backgroundCard,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.textTertiary,
    lineHeight: 20,
  },
  errorText: {
    color: theme.error,
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
  },
});
