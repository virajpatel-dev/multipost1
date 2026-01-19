import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { PlatformIcon } from "@/components/PlatformIcon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, CharacterLimits } from "@/constants/theme";
import { Platform as SocialPlatform } from "@/types";

interface CharacterCounterProps {
  text: string;
  platforms: SocialPlatform[];
}

export function CharacterCounter({ text, platforms }: CharacterCounterProps) {
  const { theme } = useTheme();
  const length = text.length;

  if (platforms.length === 0) return null;

  const getColor = (limit: number) => {
    const percentage = (length / limit) * 100;
    if (percentage >= 100) return theme.error;
    if (percentage >= 90) return theme.warning;
    return theme.textSecondary;
  };

  const platformLimits = platforms.map((platform) => ({
    platform,
    limit: CharacterLimits[platform],
    remaining: CharacterLimits[platform] - length,
  }));

  const exceedingPlatforms = platformLimits.filter((p) => p.remaining < 0);
  const strictestPlatform = platformLimits.reduce(
    (prev, curr) => (curr.remaining < prev.remaining ? curr : prev),
    platformLimits[0]
  );

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {length} characters
      </ThemedText>
      <View style={styles.platforms}>
        {platformLimits.map(({ platform, limit, remaining }) => (
          <View key={platform} style={styles.platformItem}>
            <PlatformIcon platform={platform} size={14} />
            <ThemedText
              type="small"
              style={{
                color: getColor(limit),
                fontWeight: remaining < 0 ? "600" : "400",
              }}
            >
              {remaining >= 0 ? remaining : remaining}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  platforms: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  platformItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
