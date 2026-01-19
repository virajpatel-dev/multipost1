import React from "react";
import { FlatList, View, StyleSheet, RefreshControl, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { PostCard } from "@/components/PostCard";
import { useTheme } from "@/hooks/useTheme";
import { usePosts } from "@/context/PostsContext";
import { Spacing } from "@/constants/theme";
import { Post } from "@/types";

export default function PostsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { posts, isLoading, refreshPosts } = usePosts();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }: { item: Post; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <PostCard post={item} />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require("../../assets/images/empty-posts.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h3" style={styles.emptyTitle}>
        No posts yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Tap the + button to create your first multi-platform post
      </ThemedText>
    </View>
  );

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[styles.skeleton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <View style={[styles.skeletonRow, { gap: Spacing.md }]}>
            <View
              style={[
                styles.skeletonThumbnail,
                { backgroundColor: theme.backgroundTertiary },
              ]}
            />
            <View style={styles.skeletonContent}>
              <View
                style={[
                  styles.skeletonLine,
                  { width: "80%", backgroundColor: theme.backgroundTertiary },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  { width: "50%", backgroundColor: theme.backgroundTertiary },
                ]}
              />
            </View>
          </View>
          <View style={[styles.skeletonBadges, { marginTop: Spacing.md }]}>
            {[1, 2, 3].map((j) => (
              <View
                key={j}
                style={[
                  styles.skeletonBadge,
                  { backgroundColor: theme.backgroundTertiary },
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  if (isLoading && posts.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing.xl,
          },
        ]}
      >
        {renderSkeletons()}
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          flexGrow: posts.length === 0 ? 1 : undefined,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  separator: {
    height: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  skeleton: {
    padding: Spacing.lg,
    borderRadius: 18,
  },
  skeletonRow: {
    flexDirection: "row",
  },
  skeletonThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.sm,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
  },
  skeletonBadges: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.1)",
    paddingTop: Spacing.md,
  },
  skeletonBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
});
