import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import AppLayout from "../../../components/layout/AppLayout";
import Icon from "react-native-vector-icons/FontAwesome";
import { changeConfig } from "../../../../api/user";

declare const window: any;

export default function PlanScreen() {
  const auth = useAuth();
  const { theme } = useTheme();
  const user = auth.user;
  const styles = getStyles(theme);
  const [isChanging, setIsChanging] = useState(false);

  if (!user) {
    return (
      <AppLayout>
        <View style={styles.container}>
          <Text style={styles.errorText}>No se pudo cargar la información del plan</Text>
        </View>
      </AppLayout>
    );
  }

  const currentPlan = user.plan;
  const isPremium = currentPlan === "premium";

  const handleChangePlan = async (newPlan: string) => {
    if (newPlan === currentPlan) {
      if (Platform.OS === "web") {
        window.alert("Ya tienes este plan activo");
      } else {
        Alert.alert("Información", "Ya tienes este plan activo");
      }
      return;
    }

    setIsChanging(true);
    try {
      await changeConfig(user.id, { plan: newPlan });
      await auth.refreshUser();

      if (Platform.OS === "web") {
        window.alert(`Plan cambiado exitosamente a ${newPlan.toUpperCase()}`);
      } else {
        Alert.alert("Éxito", `Plan cambiado exitosamente a ${newPlan.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      if (Platform.OS === "web") {
        window.alert("Error al cambiar el plan");
      } else {
        Alert.alert("Error", "No se pudo cambiar el plan");
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <AppLayout userName={user.username}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Icon name="star" size={48} color="#1DB954" style={styles.headerIcon} />
          <Text style={styles.title}>Gestión de Plan</Text>
          <Text style={styles.subtitle}>Tu plan actual: <Text style={styles.currentPlanText}>{currentPlan.toUpperCase()}</Text></Text>

          <View style={styles.plansContainer}>
            {/* Plan Free */}
            <View style={[styles.planCard, !isPremium && styles.planCardActive]}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Free</Text>
                {!isPremium && <Icon name="check-circle" size={24} color="#1DB954" />}
              </View>
              <Text style={styles.planPrice}>$0.00 / mes</Text>
              
              <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Acceso a millones de canciones</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Crea tus propias playlists</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Recomendaciones personalizadas</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="times" size={16} color="#ff4444" />
                  <Text style={[styles.featureText, styles.featureTextDisabled]}>Sin anuncios</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="times" size={16} color="#ff4444" />
                  <Text style={[styles.featureText, styles.featureTextDisabled]}>Con descargas</Text>
                </View>
              </View>

              {isPremium && (
                <TouchableOpacity
                  style={[styles.planButton, styles.planButtonSecondary]}
                  onPress={() => handleChangePlan("free")}
                  disabled={isChanging}
                >
                  {isChanging ? (
                    <ActivityIndicator size="small" color={theme.textPrimary} />
                  ) : (
                    <Text style={styles.planButtonTextSecondary}>Cambiar a Free</Text>
                  )}
                </TouchableOpacity>
              )}
              {!isPremium && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Plan Actual</Text>
                </View>
              )}
            </View>

            {/* Plan Premium */}
            <View style={[styles.planCard, isPremium && styles.planCardActive]}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Premium</Text>
                {isPremium && <Icon name="check-circle" size={24} color="#1DB954" />}
              </View>
              <Text style={styles.planPrice}>$9.99 / mes</Text>
              
              <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Todo lo de Free</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Sin anuncios</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Descargas ilimitadas</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Audio de alta calidad</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="check" size={16} color="#1DB954" />
                  <Text style={styles.featureText}>Escucha offline</Text>
                </View>
              </View>

              {!isPremium && (
                <TouchableOpacity
                  style={[styles.planButton, styles.planButtonPrimary]}
                  onPress={() => handleChangePlan("premium")}
                  disabled={isChanging}
                >
                  {isChanging ? (
                    <ActivityIndicator size="small" color="#071428" />
                  ) : (
                    <Text style={styles.planButtonTextPrimary}>Mejorar a Premium</Text>
                  )}
                </TouchableOpacity>
              )}
              {isPremium && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Plan Actual</Text>
                </View>
              )}
            </View>
          </View>
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
    alignItems: "center",
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  currentPlanText: {
    color: "#1DB954",
    fontWeight: "bold",
  },
  plansContainer: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  planCard: {
    flex: 1,
    minWidth: 280,
    maxWidth: 400,
    backgroundColor: theme.backgroundCard,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.border,
  },
  planCardActive: {
    borderColor: "#1DB954",
    borderWidth: 3,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  planPrice: {
    fontSize: 20,
    color: "#1DB954",
    fontWeight: "600",
    marginBottom: 24,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: theme.textPrimary,
    flex: 1,
  },
  featureTextDisabled: {
    color: theme.textTertiary,
    textDecorationLine: "line-through",
  },
  planButton: {
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
  planButtonPrimary: {
    backgroundColor: "#1DB954",
  },
  planButtonSecondary: {
    backgroundColor: theme.backgroundElevated,
    borderWidth: 2,
    borderColor: theme.border,
  },
  planButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#071428",
  },
  planButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  currentBadge: {
    backgroundColor: "#1DB954",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  currentBadgeText: {
    fontSize: 14,
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
