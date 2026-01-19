import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { createPostSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/user/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/posts/:userId", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getPosts(req.params.userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts/:userId", async (req: Request, res: Response) => {
    try {
      const result = createPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid post data", details: result.error.issues });
      }

      const post = await storage.createPost(req.params.userId, result.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.delete("/api/posts/:userId/:postId", async (req: Request, res: Response) => {
    try {
      await storage.deletePost(req.params.userId, req.params.postId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
