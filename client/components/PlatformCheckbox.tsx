import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { PlatformIcon } from "@/components/PlatformIcon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, PlatformColors } from "@/constants/theme";
import { Platform as SocialPlatform } from "@/types";

interface PlatformCheckboxProps {
  platform: SocialPlatform;
  label: string;
  sublabel?: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PlatformCheckbox({
  platform,
  label,
  sublabel,
  checked,
  onToggle,
  disabled = false,
}: PlatformCheckboxProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getBorderColor = () => {
    if (!checked) return theme.border;
    switch (platform) {
      case "facebook":
        return PlatformColors.facebook;
      case "twitter":
        return isDark ? "#FFFFFF" : "#000000";
      default:
        return theme.primary;
    }
  };

  const getCheckboxColor = () => {
    if (!checked) return "transparent";
    switch (platform) {
      case "facebook":
        return PlatformColors.facebook;
      case "twitter":
        return isDark ? "#FFFFFF" : "#000000";
      default:
        return theme.primary;
    }
  };

  const renderCheckbox = () => {
    if (platform === "instagram" && checked) {
      return (
        <LinearGradient
          colors={["#F58529", "#DD2A7B", "#8134AF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.checkbox}
        >
          <Feather name="check" size={16} color="#FFFFFF" />
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: getCheckboxColor(),
            borderColor: getBorderColor(),
            borderWidth: checked ? 0 : 2,
          },
        ]}
      >
        {checked ? (
          <Feather
            name="check"
            size={16}
            color={platform === "twitter" && !isDark ? "#FFFFFF" : "#FFFFFF"}
          />
        ) : null}
      </View>
    );
  };

  const renderBorder = () => {
    if (platform === "instagram" && checked) {
      return (
        <LinearGradient
          colors={["#F58529", "#DD2A7B", "#8134AF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius.md }]}
        />
      );
    }
    return null;
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        {
          borderColor: platform === "instagram" && checked ? "transparent" : getBorderColor(),
          backgroundColor: theme.backgroundDefault,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
      ]}
    >
      {renderBorder()}
      <View style={styles.innerContainer}>
        <PlatformIcon platform={platform} size={32} showBackground />
        <View style={styles.textContainer}>
          <ThemedText type="body" style={styles.label}>
            {label}
          </ThemedText>
          {sublabel ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {sublabel}
            </ThemedText>
          ) : null}
        </View>
        {renderCheckbox()}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
    backgroundColor: "transparent",
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
