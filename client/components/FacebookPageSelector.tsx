import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, PlatformColors } from "@/constants/theme";
import { FacebookPage } from "@/types";

interface FacebookPageSelectorProps {
  pages: FacebookPage[];
  selectedPageIds: string[];
  onTogglePage: (pageId: string) => void;
}

export function FacebookPageSelector({
  pages,
  selectedPageIds,
  onTogglePage,
}: FacebookPageSelectorProps) {
  const { theme } = useTheme();

  const handleToggle = (pageId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTogglePage(pageId);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={[styles.header, { color: theme.textSecondary }]}>
        Select Facebook Pages
      </ThemedText>
      {pages.map((page) => {
        const isSelected = selectedPageIds.includes(page.id);
        return (
          <Pressable
            key={page.id}
            onPress={() => handleToggle(page.id)}
            style={[
              styles.pageItem,
              {
                backgroundColor: isSelected
                  ? PlatformColors.facebook + "15"
                  : theme.backgroundSecondary,
                borderColor: isSelected ? PlatformColors.facebook : "transparent",
              },
            ]}
          >
            <View style={[styles.pageAvatar, { backgroundColor: PlatformColors.facebook }]}>
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {page.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="body" style={styles.pageName}>
              {page.name}
            </ThemedText>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isSelected ? PlatformColors.facebook : "transparent",
                  borderColor: isSelected ? PlatformColors.facebook : theme.border,
                },
              ]}
            >
              {isSelected ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    marginLeft: Spacing["3xl"],
    marginTop: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.xs,
  },
  pageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  pageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pageName: {
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
