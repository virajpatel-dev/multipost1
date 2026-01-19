import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { PlatformBadge } from "@/components/PlatformBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post } from "@/types";

interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PostCard({ post, onPress }: PostCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const successCount = post.platformStatuses.filter((s) => s.status === "success").length;
  const failedCount = post.platformStatuses.filter((s) => s.status === "failed").length;
  const scheduledCount = post.platformStatuses.filter((s) => s.status === "scheduled").length;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        {post.mediaUri ? (
          <Image
            source={{ uri: post.mediaUri }}
            style={styles.thumbnail}
            contentFit="cover"
          />
        ) : null}
        <View style={styles.textContent}>
          <ThemedText type="body" numberOfLines={2} style={styles.caption}>
            {post.caption}
          </ThemedText>
          <View style={styles.meta}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatDate(post.createdAt)}
            </ThemedText>
            {scheduledCount > 0 ? (
              <View style={[styles.statusPill, { backgroundColor: theme.warning + "20" }]}>
                <ThemedText type="small" style={{ color: theme.warning }}>
                  Scheduled
                </ThemedText>
              </View>
            ) : null}
            {successCount > 0 ? (
              <View style={[styles.statusPill, { backgroundColor: theme.success + "20" }]}>
                <ThemedText type="small" style={{ color: theme.success }}>
                  {successCount} Published
                </ThemedText>
              </View>
            ) : null}
            {failedCount > 0 ? (
              <View style={[styles.statusPill, { backgroundColor: theme.error + "20" }]}>
                <ThemedText type="small" style={{ color: theme.error }}>
                  {failedCount} Failed
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.platformBadges}>
        {post.platformStatuses.map((status, index) => (
          <PlatformBadge
            key={`${status.platform}-${index}`}
            platform={status.platform}
            status={status.status}
          />
        ))}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  content: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  textContent: {
    flex: 1,
    justifyContent: "center",
  },
  caption: {
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  platformBadges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.1)",
  },
});
