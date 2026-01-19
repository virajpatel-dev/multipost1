import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B6B6B",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#FF6B35",
    link: "#FF6B35",
    primary: "#FF6B35",
    secondary: "#004E89",
    backgroundRoot: "#F7F9FC",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F0F2F5",
    backgroundTertiary: "#E6E8EB",
    success: "#27AE60",
    warning: "#F39C12",
    error: "#E74C3C",
    facebook: "#1877F2",
    instagram: "#DD2A7B",
    twitter: "#000000",
    border: "#E0E0E0",
  },
  dark: {
    text: "#F5F5F7",
    textSecondary: "#9A9A9D",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FF6B35",
    link: "#FF6B35",
    primary: "#FF6B35",
    secondary: "#0A84FF",
    backgroundRoot: "#0F0F0F",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3A3A3C",
    success: "#30D158",
    warning: "#FFD60A",
    error: "#FF453A",
    facebook: "#1877F2",
    instagram: "#DD2A7B",
    twitter: "#FFFFFF",
    border: "#38383A",
  },
};

export const PlatformColors = {
  facebook: "#1877F2",
  instagram: ["#F58529", "#DD2A7B", "#8134AF"],
  twitter: "#000000",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  heading: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  tiny: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const CharacterLimits = {
  facebook: 63206,
  instagram: 2200,
  twitter: 280,
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
