import { z } from "zod";

export const platformSchema = z.enum(["facebook", "instagram", "twitter"]);
export type Platform = z.infer<typeof platformSchema>;

export const postStatusSchema = z.enum(["pending", "publishing", "success", "failed", "scheduled"]);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const facebookPageSchema = z.object({
  id: z.string(),
  name: z.string(),
  accessToken: z.string(),
  picture: z.string().optional(),
});
export type FacebookPage = z.infer<typeof facebookPageSchema>;

export const connectedPlatformSchema = z.object({
  platform: platformSchema,
  connected: z.boolean(),
  username: z.string().optional(),
  profilePicture: z.string().optional(),
  pages: z.array(facebookPageSchema).optional(),
});
export type ConnectedPlatform = z.infer<typeof connectedPlatformSchema>;

export const platformStatusSchema = z.object({
  platform: platformSchema,
  status: postStatusSchema,
  error: z.string().optional(),
  postId: z.string().optional(),
});
export type PlatformStatus = z.infer<typeof platformStatusSchema>;

export const postSchema = z.object({
  id: z.string(),
  caption: z.string(),
  mediaUri: z.string().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  platforms: z.array(platformSchema),
  facebookPageIds: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
  createdAt: z.string(),
  platformStatuses: z.array(platformStatusSchema),
});
export type Post = z.infer<typeof postSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  connectedPlatforms: z.array(connectedPlatformSchema),
});
export type User = z.infer<typeof userSchema>;

export const createPostSchema = z.object({
  caption: z.string().min(1),
  mediaUri: z.string().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  platforms: z.array(platformSchema).min(1),
  facebookPageIds: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
});
export type CreatePost = z.infer<typeof createPostSchema>;

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
