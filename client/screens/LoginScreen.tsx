import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, ActivityIndicator, Alert, Platform as RNPlatform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { PlatformIcon } from "@/components/PlatformIcon";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OAuthButtonProps {
  provider: "facebook" | "twitter";
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
}

function OAuthButton({ provider, onPress, isLoading, disabled }: OAuthButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const isFacebook = provider === "facebook";
  const backgroundColor = isFacebook ? "#1877F2" : (isDark ? "#FFFFFF" : "#000000");
  const textColor = isFacebook ? "#FFFFFF" : (isDark ? "#000000" : "#FFFFFF");
  const label = isFacebook ? "Continue with Facebook" : "Continue with X";

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.oauthButton,
        { backgroundColor, opacity: disabled ? 0.6 : 1 },
        animatedStyle,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          <View style={styles.oauthIcon}>
            <PlatformIcon platform={provider === "facebook" ? "facebook" : "twitter"} size={22} />
          </View>
          <ThemedText type="body" style={[styles.oauthText, { color: textColor }]}>
            {label}
          </ThemedText>
        </>
      )}
    </AnimatedPressable>
  );
}

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<"facebook" | "twitter" | null>(null);

  const handleLogin = async (provider: "facebook" | "twitter") => {
    setLoadingProvider(provider);
    try {
      await login(provider);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      if (RNPlatform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Login Error", message);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0F0F0F", "#1A1A1F", "#0F0F0F"] : ["#F7F9FC", "#FFFFFF", "#F7F9FC"]}
      style={styles.gradient}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + "15" }]}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          <ThemedText type="h1" style={styles.title}>
            MultiPost
          </ThemedText>
          <ThemedText type="body" style={[styles.tagline, { color: theme.textSecondary }]}>
            Share once, publish everywhere
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.featuresSection}>
          <FeatureItem
            icon="share-2"
            text="Post to Facebook, Instagram, and X simultaneously"
            theme={theme}
          />
          <FeatureItem
            icon="layers"
            text="Publish to multiple Facebook Pages at once"
            theme={theme}
          />
          <FeatureItem
            icon="clock"
            text="Schedule posts for the perfect timing"
            theme={theme}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.authSection}>
          <OAuthButton
            provider="facebook"
            onPress={() => handleLogin("facebook")}
            isLoading={loadingProvider === "facebook"}
            disabled={isLoading || loadingProvider !== null}
          />
          <OAuthButton
            provider="twitter"
            onPress={() => handleLogin("twitter")}
            isLoading={loadingProvider === "twitter"}
            disabled={isLoading || loadingProvider !== null}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(800).duration(600)} style={styles.footerSection}>
          <ThemedText type="small" style={[styles.footerText, { color: theme.textSecondary }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

function FeatureItem({ icon, text, theme }: { icon: string; text: string; theme: any }) {
  const { Feather } = require("@expo/vector-icons");
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: theme.primary + "15" }]}>
        <Feather name={icon} size={18} color={theme.primary} />
      </View>
      <ThemedText type="small" style={[styles.featureText, { color: theme.textSecondary }]}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  tagline: {
    textAlign: "center",
  },
  featuresSection: {
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  authSection: {
    gap: Spacing.md,
  },
  oauthButton: {
    height: Spacing.buttonHeight + 4,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  oauthIcon: {
    width: 24,
    alignItems: "center",
  },
  oauthText: {
    fontWeight: "600",
    fontSize: 16,
  },
  footerSection: {
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    lineHeight: 20,
  },
});
