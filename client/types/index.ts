export type Platform = "facebook" | "instagram" | "twitter";

export type PostStatus = "pending" | "publishing" | "success" | "failed" | "scheduled";

export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
  picture?: string;
}

export interface ConnectedPlatform {
  platform: Platform;
  connected: boolean;
  username?: string;
  profilePicture?: string;
  pages?: FacebookPage[];
}

export interface PlatformStatus {
  platform: Platform;
  status: PostStatus;
  error?: string;
  postId?: string;
}

export interface Post {
  id: string;
  caption: string;
  mediaUri?: string;
  mediaType?: "image" | "video";
  platforms: Platform[];
  facebookPageIds?: string[];
  scheduledAt?: string;
  createdAt: string;
  platformStatuses: PlatformStatus[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  connectedPlatforms: ConnectedPlatform[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
