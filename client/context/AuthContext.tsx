import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, User, ConnectedPlatform } from "@/types";

interface AuthContextType extends AuthState {
  login: (provider: "facebook" | "twitter") => Promise<void>;
  logout: () => Promise<void>;
  connectPlatform: (platform: "facebook" | "twitter") => Promise<void>;
  disconnectPlatform: (platform: "facebook" | "twitter" | "instagram") => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "@multipost_user";

const mockFacebookUser: Partial<User> = {
  id: "fb_123456",
  name: "Demo User",
  email: "demo@example.com",
  connectedPlatforms: [
    {
      platform: "facebook",
      connected: true,
      username: "Demo User",
      pages: [
        { id: "page_1", name: "My Business Page", accessToken: "mock_token" },
        { id: "page_2", name: "My Brand Page", accessToken: "mock_token" },
        { id: "page_3", name: "Personal Blog", accessToken: "mock_token" },
      ],
    },
    {
      platform: "instagram",
      connected: true,
      username: "@demouser",
    },
  ],
};

const mockTwitterUser: Partial<User> = {
  id: "tw_789012",
  name: "Demo User",
  email: "demo@example.com",
  connectedPlatforms: [
    {
      platform: "twitter",
      connected: true,
      username: "@demouser",
    },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const login = async (provider: "facebook" | "twitter") => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const baseUser = provider === "facebook" ? mockFacebookUser : mockTwitterUser;
    const user: User = {
      id: baseUser.id!,
      name: baseUser.name!,
      email: baseUser.email!,
      connectedPlatforms: baseUser.connectedPlatforms || [],
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem("@multipost_posts");
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const connectPlatform = async (platform: "facebook" | "twitter") => {
    if (!state.user) return;
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newPlatform: ConnectedPlatform = platform === "facebook"
      ? {
          platform: "facebook",
          connected: true,
          username: "Demo User",
          pages: [
            { id: "page_1", name: "My Business Page", accessToken: "mock_token" },
            { id: "page_2", name: "My Brand Page", accessToken: "mock_token" },
          ],
        }
      : {
          platform: "twitter",
          connected: true,
          username: "@demouser",
        };
    
    const instagramPlatform: ConnectedPlatform = {
      platform: "instagram",
      connected: true,
      username: "@demouser",
    };
    
    const existingPlatforms = state.user.connectedPlatforms.filter(
      (p) => p.platform !== platform && p.platform !== "instagram"
    );
    
    const updatedPlatforms = platform === "facebook"
      ? [...existingPlatforms, newPlatform, instagramPlatform]
      : [...existingPlatforms, newPlatform];
    
    const updatedUser: User = {
      ...state.user,
      connectedPlatforms: updatedPlatforms,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setState((prev) => ({ ...prev, user: updatedUser }));
  };

  const disconnectPlatform = async (platform: "facebook" | "twitter" | "instagram") => {
    if (!state.user) return;
    
    let updatedPlatforms = state.user.connectedPlatforms.filter(
      (p) => p.platform !== platform
    );
    
    if (platform === "facebook") {
      updatedPlatforms = updatedPlatforms.filter((p) => p.platform !== "instagram");
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
