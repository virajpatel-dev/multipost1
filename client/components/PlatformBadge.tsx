import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { PlatformIcon } from "@/components/PlatformIcon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Platform as SocialPlatform, PostStatus } from "@/types";

interface PlatformBadgeProps {
  platform: SocialPlatform;
  status: PostStatus;
  size?: "small" | "medium";
}

export function PlatformBadge({ platform, status, size = "small" }: PlatformBadgeProps) {
  const { theme } = useTheme();
  const iconSize = size === "small" ? 16 : 24;
  const badgeSize = size === "small" ? 10 : 14;
  const containerSize = size === "small" ? 28 : 40;

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return { name: "check" as const, color: theme.success };
      case "failed":
        return { name: "x" as const, color: theme.error };
      case "scheduled":
        return { name: "clock" as const, color: theme.warning };
      case "publishing":
        return { name: "loader" as const, color: theme.primary };
      default:
        return null;
    }
  };

  const statusIcon = getStatusIcon();

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <PlatformIcon platform={platform} size={iconSize} showBackground />
      {statusIcon ? (
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: theme.backgroundDefault,
              width: badgeSize + 4,
              height: badgeSize + 4,
            },
          ]}
        >
          <Feather name={statusIcon.name} size={badgeSize} color={statusIcon.color} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
