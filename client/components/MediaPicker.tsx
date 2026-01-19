import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface MediaPickerProps {
  mediaUri?: string;
  mediaType?: "image" | "video";
  onMediaSelect: (uri: string, type: "image" | "video") => void;
  onMediaRemove: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MediaPicker({
  mediaUri,
  mediaType,
  onMediaSelect,
  onMediaRemove,
}: MediaPickerProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (!mediaUri) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [mediaUri]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const pickImage = async () => {
    if (Platform.OS === "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const type = asset.type === "video" ? "video" : "image";
      onMediaSelect(asset.uri, type);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMediaRemove();
  };

  if (mediaUri) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: mediaUri }}
          style={styles.preview}
          contentFit="cover"
        />
        {mediaType === "video" ? (
          <View style={styles.videoIndicator}>
            <Feather name="play-circle" size={32} color="#FFFFFF" />
          </View>
        ) : null}
        <Pressable
          onPress={handleRemove}
          style={[styles.removeButton, { backgroundColor: theme.error }]}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPress={pickImage}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.picker,
        {
          borderColor: theme.border,
          backgroundColor: theme.backgroundSecondary,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: theme.primary + "20" }]}>
        <Feather name="image" size={32} color={theme.primary} />
      </View>
      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        Add photo or video
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, opacity: 0.7 }}>
        Tap to select from your library
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: 180,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  previewContainer: {
    position: "relative",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: 200,
  },
  videoIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  removeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
