import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post, Platform, PlatformStatus } from "@/types";

interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  createPost: (post: Omit<Post, "id" | "createdAt" | "platformStatuses">) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

const STORAGE_KEY = "@multipost_posts";

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedPosts = JSON.parse(stored) as Post[];
        setPosts(loadedPosts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePosts = async (newPosts: Post[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
  };

  const simulatePublishing = (platforms: Platform[], facebookPageIds?: string[]): PlatformStatus[] => {
    const statuses: PlatformStatus[] = [];
    
    platforms.forEach((platform) => {
      if (platform === "facebook" && facebookPageIds && facebookPageIds.length > 0) {
        facebookPageIds.forEach((pageId) => {
          const success = Math.random() > 0.1;
          statuses.push({
            platform: "facebook",
            status: success ? "success" : "failed",
            postId: success ? `fb_post_${Date.now()}_${pageId}` : undefined,
            error: success ? undefined : "Failed to publish to Facebook page",
          });
        });
      } else if (platform !== "facebook") {
        const success = Math.random() > 0.15;
        statuses.push({
          platform,
          status: success ? "success" : "failed",
          postId: success ? `${platform}_post_${Date.now()}` : undefined,
          error: success ? undefined : `Failed to publish to ${platform}`,
        });
      }
    });
    
    if (platforms.includes("facebook") && (!facebookPageIds || facebookPageIds.length === 0)) {
      const success = Math.random() > 0.1;
      statuses.push({
        platform: "facebook",
        status: success ? "success" : "failed",
        postId: success ? `fb_profile_${Date.now()}` : undefined,
        error: success ? undefined : "Failed to publish to Facebook profile",
      });
    }
    
    return statuses;
  };

  const createPost = async (postData: Omit<Post, "id" | "createdAt" | "platformStatuses">): Promise<Post> => {
    const platformStatuses = postData.scheduledAt
      ? postData.platforms.map((platform) => ({
          platform,
          status: "scheduled" as const,
        }))
      : simulatePublishing(postData.platforms, postData.facebookPageIds);

    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      platformStatuses,
    };

    const updatedPosts = [newPost, ...posts];
    await savePosts(updatedPosts);
    setPosts(updatedPosts);
    
    return newPost;
  };

  const deletePost = async (id: string) => {
    const updatedPosts = posts.filter((p) => p.id !== id);
    await savePosts(updatedPosts);
    setPosts(updatedPosts);
  };

  const refreshPosts = async () => {
    setIsLoading(true);
    await loadPosts();
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        createPost,
        deletePost,
        refreshPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
