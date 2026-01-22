import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { AuthState, User, ConnectedPlatform, FacebookPage } from "@/types";
import { getApiUrl } from "@/lib/query-client";

WebBrowser.maybeCompleteAuthSession();

interface OAuthTokens {
  facebook?: {
    accessToken: string;
    userId: string;
    pages: FacebookPage[];
  };
  instagram?: {
    id: string;
    username: string;
    pageId: string;
    pageAccessToken: string;
  };
  x?: {
    accessToken: string;
    refreshToken?: string;
    userId: string;
    username: string;
  };
}

interface AuthContextType extends AuthState {
  login: (provider: "facebook" | "twitter") => Promise<void>;
  logout: () => Promise<void>;
  connectPlatform: (platform: "facebook" | "twitter") => Promise<void>;
  disconnectPlatform: (platform: "facebook" | "twitter" | "instagram") => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  tokens: OAuthTokens;
  oauthConfig: { facebook: { configured: boolean; appId: string | null }; x: { configured: boolean; clientId: string | null } } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "@multipost_user";
const TOKENS_KEY = "@multipost_tokens";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [tokens, setTokens] = useState<OAuthTokens>({});
  const [oauthConfig, setOauthConfig] = useState<AuthContextType["oauthConfig"]>(null);

  const apiUrl = getApiUrl();
  console.log("API BASE URL =", apiUrl);

  const redirectUri = `${apiUrl}/oauth/facebook`;

  useEffect(() => {
    loadUser();
    fetchOAuthConfig();
  }, []);

  const fetchOAuthConfig = async () => {
    try {
      const response = await fetch(new URL("/api/oauth/config", apiUrl).toString());
      if (response.ok) {
        const config = await response.json();
        setOauthConfig(config);
      }
    } catch (error) {
      console.error("Failed to fetch OAuth config:", error);
    }
  };

  const loadUser = async () => {
    try {
      const [storedUser, storedTokens] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(TOKENS_KEY),
      ]);

      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }

      if (storedTokens) {
        setTokens(JSON.parse(storedTokens));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const loginWithFacebook = async (): Promise<void> => {
    if (!oauthConfig?.facebook.configured || !oauthConfig.facebook.appId) {
      throw new Error("Facebook OAuth is not configured. Please set up your Meta Developer App credentials.");
    }

    const discovery = {
      authorizationEndpoint: "https://www.facebook.com/v19.0/dialog/oauth",
      tokenEndpoint: "https://graph.facebook.com/v19.0/oauth/access_token",
    };

    const request = new AuthSession.AuthRequest({
      clientId: oauthConfig.facebook.appId,
      redirectUri,
      scopes: [
        "public_profile",
        "email",
        "pages_show_list",
        "pages_read_engagement",
        "pages_manage_posts",
        "instagram_basic",
        "instagram_content_publish",
      ],
      responseType: AuthSession.ResponseType.Code,
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== "success" || !result.params.code) {
      throw new Error("Facebook login was cancelled or failed");
    }

    const tokenResponse = await fetch(new URL("/api/oauth/facebook/token", apiUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: result.params.code,
        redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.message || "Failed to complete Facebook login");
    }

    const data = await tokenResponse.json();

    const connectedPlatforms: ConnectedPlatform[] = [
      {
        platform: "facebook",
        connected: true,
        username: data.user.name,
        profilePicture: data.user.avatar,
        pages: data.facebook.pages,
      },
    ];

    if (data.instagram) {
      connectedPlatforms.push({
        platform: "instagram",
        connected: true,
        username: `@${data.instagram.username}`,
      });
    }

    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.avatar,
      connectedPlatforms,
    };

    const newTokens: OAuthTokens = {
      facebook: {
        accessToken: data.facebook.accessToken,
        userId: data.facebook.userId,
        pages: data.facebook.pages,
      },
      instagram: data.instagram || undefined,
    };

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)),
      AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(newTokens)),
    ]);

    setTokens(newTokens);
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const loginWithX = async (): Promise<void> => {
    if (!oauthConfig?.x.configured || !oauthConfig.x.clientId) {
      throw new Error("X OAuth is not configured. Please set up your X Developer App credentials.");
    }

    const discovery = {
      authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
      tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
    };

    const codeVerifier = AuthSession.generateCodeVerifier();
    const codeChallenge = await AuthSession.getCodeChallenge(codeVerifier);

    const request = new AuthSession.AuthRequest({
      clientId: oauthConfig.x.clientId,
      redirectUri,
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      responseType: AuthSession.ResponseType.Code,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      codeChallenge,
      extraParams: {
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      },
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== "success" || !result.params.code) {
      throw new Error("X login was cancelled or failed");
    }

    const tokenResponse = await fetch(new URL("/api/oauth/x/token", apiUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: result.params.code,
        redirectUri,
        codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.message || "Failed to complete X login");
    }

    const data = await tokenResponse.json();

    const user: User = {
      id: data.user.id,
      name: data.user.name,
      email: "",
      avatar: data.user.avatar,
      connectedPlatforms: [
        {
          platform: "twitter",
          connected: true,
          username: `@${data.x.username}`,
          profilePicture: data.user.avatar,
        },
      ],
    };

    const newTokens: OAuthTokens = {
      x: {
        accessToken: data.x.accessToken,
        refreshToken: data.x.refreshToken,
        userId: data.x.userId,
        username: data.x.username,
      },
    };

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user)),
      AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(newTokens)),
    ]);

    setTokens(newTokens);
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const login = async (provider: "facebook" | "twitter") => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (provider === "facebook") {
        await loginWithFacebook();
      } else {
        await loginWithX();
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(TOKENS_KEY),
      AsyncStorage.removeItem("@multipost_posts"),
    ]);
    setTokens({});
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const connectPlatform = async (platform: "facebook" | "twitter") => {
    if (!state.user) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (platform === "facebook") {
        await loginWithFacebook();
        if (state.user) {
          const existingPlatforms = state.user.connectedPlatforms.filter(
            (p) => p.platform !== "facebook" && p.platform !== "instagram"
          );
          const fbPlatforms = tokens.facebook
            ? [
                {
                  platform: "facebook" as const,
                  connected: true,
                  username: state.user.name,
                  pages: tokens.facebook.pages,
                },
                ...(tokens.instagram
                  ? [
                      {
                        platform: "instagram" as const,
                        connected: true,
                        username: `@${tokens.instagram.username}`,
                      },
                    ]
                  : []),
              ]
            : [];

          const updatedUser = {
            ...state.user,
            connectedPlatforms: [...existingPlatforms, ...fbPlatforms],
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          setState((prev) => ({ ...prev, user: updatedUser, isLoading: false }));
        }
      } else {
        await loginWithX();
        if (state.user && tokens.x) {
          const existingPlatforms = state.user.connectedPlatforms.filter(
            (p) => p.platform !== "twitter"
          );
          const xPlatform: ConnectedPlatform = {
            platform: "twitter",
            connected: true,
            username: `@${tokens.x.username}`,
          };
          const updatedUser = {
            ...state.user,
            connectedPlatforms: [...existingPlatforms, xPlatform],
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          setState((prev) => ({ ...prev, user: updatedUser, isLoading: false }));
        }
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const disconnectPlatform = async (platform: "facebook" | "twitter" | "instagram") => {
    if (!state.user) return;

    let updatedPlatforms = state.user.connectedPlatforms.filter(
      (p) => p.platform !== platform
    );

    if (platform === "facebook") {
      updatedPlatforms = updatedPlatforms.filter((p) => p.platform !== "instagram");
      const newTokens = { ...tokens };
      delete newTokens.facebook;
      delete newTokens.instagram;
      setTokens(newTokens);
      await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(newTokens));
    }

    if (platform === "twitter") {
      const newTokens = { ...tokens };
      delete newTokens.x;
      setTokens(newTokens);
      await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(newTokens));
    }

    const updatedUser: User = {
      ...state.user,
      connectedPlatforms: updatedPlatforms,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setState((prev) => ({ ...prev, user: updatedUser }));
  };

  const updateUser = async (user: User) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        connectPlatform,
        disconnectPlatform,
        updateUser,
        tokens,
        oauthConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
