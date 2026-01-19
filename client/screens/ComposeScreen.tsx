import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { MediaPicker } from "@/components/MediaPicker";
import { PlatformCheckbox } from "@/components/PlatformCheckbox";
import { FacebookPageSelector } from "@/components/FacebookPageSelector";
import { CharacterCounter } from "@/components/CharacterCounter";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/context/PostsContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Platform as SocialPlatform, FacebookPage } from "@/types";

export default function ComposeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const { createPost } = usePosts();

  const [caption, setCaption] = useState("");
  const [mediaUri, setMediaUri] = useState<string | undefined>();
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date(Date.now() + 3600000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const facebookPlatform = user?.connectedPlatforms.find((p) => p.platform === "facebook");
  const instagramPlatform = user?.connectedPlatforms.find((p) => p.platform === "instagram");
  const twitterPlatform = user?.connectedPlatforms.find((p) => p.platform === "twitter");
  const facebookPages = facebookPlatform?.pages || [];

  const canPublish = caption.trim().length > 0 && selectedPlatforms.length > 0;

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
    if (platform === "facebook" && selectedPlatforms.includes("facebook")) {
      setSelectedPageIds([]);
    }
  };

  const togglePage = (pageId: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleMediaSelect = (uri: string, type: "image" | "video") => {
    setMediaUri(uri);
    setMediaType(type);
  };

  const handleMediaRemove = () => {
    setMediaUri(undefined);
    setMediaType(undefined);
  };

  const handlePublish = async () => {
    if (!canPublish || isPublishing) return;
    
    setIsPublishing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createPost({
        caption,
        mediaUri,
        mediaType,
        platforms: selectedPlatforms,
        facebookPageIds: selectedPageIds.length > 0 ? selectedPageIds : undefined,
        scheduledAt: scheduleEnabled ? scheduledDate.toISOString() : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsPublishing(false);
    }
  };

  const formatScheduleDate = () => {
    return scheduledDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        <MediaPicker
          mediaUri={mediaUri}
          mediaType={mediaType}
          onMediaSelect={handleMediaSelect}
          onMediaRemove={handleMediaRemove}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.section}>
        <ThemedText type="heading" style={styles.sectionTitle}>
          Caption
        </ThemedText>
        <View
          style={[
            styles.textInputContainer,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: theme.text }]}
            placeholder="What would you like to share?"
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={63206}
            value={caption}
            onChangeText={setCaption}
            textAlignVertical="top"
          />
        </View>
        <CharacterCounter text={caption} platforms={selectedPlatforms} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.section}>
        <ThemedText type="heading" style={styles.sectionTitle}>
          Publish to
        </ThemedText>
        <View style={styles.platformsContainer}>
          {facebookPlatform?.connected ? (
            <>
              <PlatformCheckbox
                platform="facebook"
                label="Facebook"
                sublabel={facebookPages.length > 0 ? `${facebookPages.length} pages available` : "Profile only"}
                checked={selectedPlatforms.includes("facebook")}
                onToggle={() => togglePlatform("facebook")}
              />
              {selectedPlatforms.includes("facebook") && facebookPages.length > 0 ? (
                <FacebookPageSelector
                  pages={facebookPages}
                  selectedPageIds={selectedPageIds}
                  onTogglePage={togglePage}
                />
              ) : null}
            </>
          ) : null}

          {instagramPlatform?.connected ? (
            <PlatformCheckbox
              platform="instagram"
              label="Instagram"
              sublabel={instagramPlatform.username}
              checked={selectedPlatforms.includes("instagram")}
              onToggle={() => togglePlatform("instagram")}
            />
          ) : null}

          {twitterPlatform?.connected ? (
            <PlatformCheckbox
              platform="twitter"
              label="X (Twitter)"
              sublabel={twitterPlatform.username}
              checked={selectedPlatforms.includes("twitter")}
              onToggle={() => togglePlatform("twitter")}
            />
          ) : null}

          {!facebookPlatform?.connected && !instagramPlatform?.connected && !twitterPlatform?.connected ? (
            <View style={[styles.noPlatforms, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="alert-circle" size={24} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
                No platforms connected. Go to Account to connect your social media accounts.
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.section}>
        <View style={styles.scheduleHeader}>
          <ThemedText type="heading">Schedule</ThemedText>
          <Switch
            value={scheduleEnabled}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setScheduleEnabled(value);
            }}
            trackColor={{ false: theme.backgroundTertiary, true: theme.primary + "80" }}
            thumbColor={scheduleEnabled ? theme.primary : theme.backgroundDefault}
          />
        </View>
        {scheduleEnabled ? (
          <View style={styles.scheduleContainer}>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={[styles.scheduleButton, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather name="calendar" size={20} color={theme.textSecondary} />
              <ThemedText type="body">{formatScheduleDate()}</ThemedText>
            </Pressable>
            {showDatePicker ? (
              <DateTimePicker
                value={scheduledDate}
                mode="datetime"
                display="spinner"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setScheduledDate(date);
                }}
              />
            ) : null}
          </View>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(300)} style={styles.publishSection}>
        <Pressable
          onPress={handlePublish}
          disabled={!canPublish || isPublishing}
          style={[
            styles.publishButton,
            {
              backgroundColor: canPublish ? theme.primary : theme.backgroundTertiary,
              opacity: isPublishing ? 0.8 : 1,
            },
          ]}
        >
          {isPublishing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather
                name={scheduleEnabled ? "clock" : "send"}
                size={20}
                color="#FFFFFF"
              />
              <ThemedText type="body" style={styles.publishButtonText}>
                {scheduleEnabled ? "Schedule Post" : "Publish Now"}
              </ThemedText>
            </>
          )}
        </Pressable>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  textInputContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    minHeight: 120,
  },
  textInput: {
    padding: Spacing.lg,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
  },
  platformsContainer: {
    gap: Spacing.md,
  },
  noPlatforms: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleContainer: {
    gap: Spacing.md,
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  publishSection: {
    marginTop: Spacing.lg,
  },
  publishButton: {
    height: Spacing.buttonHeight + 4,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
