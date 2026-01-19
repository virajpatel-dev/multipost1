import { randomUUID } from "crypto";
import type { User, Post, CreatePost, Platform, PlatformStatus } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  getPosts(userId: string): Promise<Post[]>;
  createPost(userId: string, post: CreatePost): Promise<Post>;
  deletePost(userId: string, postId: string): Promise<void>;
}

function simulatePublishing(platforms: Platform[], facebookPageIds?: string[]): PlatformStatus[] {
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private posts: Map<string, Post[]>;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const id = randomUUID();
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async getPosts(userId: string): Promise<Post[]> {
    return this.posts.get(userId) || [];
  }

  async createPost(userId: string, postData: CreatePost): Promise<Post> {
    const platformStatuses = postData.scheduledAt
      ? postData.platforms.map((platform) => ({
          platform,
          status: "scheduled" as const,
        }))
      : simulatePublishing(postData.platforms, postData.facebookPageIds);

    const post: Post = {
      ...postData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      platformStatuses,
    };

    const userPosts = this.posts.get(userId) || [];
    userPosts.unshift(post);
    this.posts.set(userId, userPosts);

    return post;
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const userPosts = this.posts.get(userId) || [];
    const filtered = userPosts.filter((p) => p.id !== postId);
    this.posts.set(userId, filtered);
  }
}

export const storage = new MemStorage();
