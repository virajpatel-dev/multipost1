import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PlatformIcon } from "@/components/PlatformIcon";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { user, logout, connectPlatform, disconnectPlatform } = useAuth();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);

  const facebookPlatform = user?.connectedPlatforms.find((p) => p.platform === "facebook");
  const instagramPlatform = user?.connectedPlatforms.find((p) => p.platform === "instagram");
  const twitterPlatform = user?.connectedPlatforms.find((p) => p.platform === "twitter");

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLogoutModal(false);
    await logout();
  };

  const handleConnect = async (platform: "facebook" | "twitter") => {
    setConnectingPlatform(platform);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await connectPlatform(platform);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (platform: "facebook" | "twitter" | "instagram") => {
    setDisconnectingPlatform(platform);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await disconnectPlatform(platform);
    } finally {
      setDisconnectingPlatform(null);
    }
  };

  const renderPlatformItem = (
    platform: "facebook" | "instagram" | "twitter",
    connected: boolean,
    username?: string,
    canConnect: boolean = true
  ) => {
    const isConnecting = connectingPlatform === platform;
    const isDisconnecting = disconnectingPlatform === platform;
    const platformName = platform === "twitter" ? "X (Twitter)" : platform.charAt(0).toUpperCase() + platform.slice(1);
    
    return (
      <View
        key={platform}
        style={[styles.platformItem, { backgroundColor: theme.backgroundDefault }]}
      >
        <PlatformIcon platform={platform} size={40} showBackground />
        <View style={styles.platformInfo}>
          <ThemedText type="body" style={styles.platformName}>
            {platformName}
          </ThemedText>
          {connected ? (
            <ThemedText type="small" style={{ color: theme.success }}>
              Connected{username ? ` as ${username}` : ""}
            </ThemedText>
          ) : (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Not connected
            </ThemedText>
          )}
        </View>
        {connected ? (
          <Pressable
            onPress={() => handleDisconnect(platform)}
            disabled={isDisconnecting}
            style={[styles.disconnectButton, { opacity: isDisconnecting ? 0.5 : 1 }]}
          >
            {isDisconnecting ? (
              <ActivityIndicator size="small" color={theme.error} />
            ) : (
              <ThemedText type="small" style={{ color: theme.error }}>
                Disconnect
              </ThemedText>
            )}
          </Pressable>
        ) : canConnect ? (
          <Pressable
            onPress={() => handleConnect(platform as "facebook" | "twitter")}
            disabled={isConnecting}
            style={[styles.connectButton, { backgroundColor: theme.primary, opacity: isConnecting ? 0.7 : 1 }]}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Connect
              </ThemedText>
            )}
          </Pressable>
        ) : (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Via Facebook
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <>
      <KeyboardAwareScrollViewCompat
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
      >
        <Animated.View entering={FadeIn.duration(300)} style={styles.profileSection}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <ThemedText type="h2" style={{ color: "#FFFFFF" }}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </ThemedText>
            )}
          </View>
          <ThemedText type="h3" style={styles.userName}>
            {user?.name || "User"}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {user?.email || ""}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.section}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            Connected Platforms
          </ThemedText>
          <View style={styles.platformsList}>
            {renderPlatformItem("facebook", !!facebookPlatform?.connected, facebookPlatform?.username)}
            {renderPlatformItem("instagram", !!instagramPlatform?.connected, instagramPlatform?.username, false)}
            {renderPlatformItem("twitter", !!twitterPlatform?.connected, twitterPlatform?.username)}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.section}>
          <ThemedText type="heading" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <View style={styles.settingsList}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowLogoutModal(true);
              }}
              style={[styles.settingItem, { backgroundColor: theme.backgroundDefault }]}
            >
              <View style={[styles.settingIcon, { backgroundColor: theme.error + "15" }]}>
                <Feather name="log-out" size={20} color={theme.error} />
              </View>
              <ThemedText type="body" style={{ color: theme.error }}>
                Log Out
              </ThemedText>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.footerSection}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            MultiPost v1.0.0
          </ThemedText>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.modalTitle}>
              Log Out
            </ThemedText>
            <ThemedText type="body" style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Are you sure you want to log out? Your posts will be saved locally.
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowLogoutModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={handleLogout}
                style={[styles.modalButton, { backgroundColor: theme.error }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Log Out
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing["2xl"],
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  platformsList: {
    gap: Spacing.sm,
  },
  platformItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontWeight: "600",
  },
  connectButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  disconnectButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  settingsList: {
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerSection: {
    paddingVertical: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalMessage: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
