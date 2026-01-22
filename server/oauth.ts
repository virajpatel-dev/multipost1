import type { Express, Request, Response } from "express";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const X_CLIENT_ID = process.env.X_CLIENT_ID || "";
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET || "";

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserResponse {
  id: string;
  name: string;
  email?: string;
  picture?: { data: { url: string } };
}

interface FacebookPageResponse {
  data: Array<{
    id: string;
    name: string;
    access_token: string;
    picture?: { data: { url: string } };
  }>;
}

interface InstagramAccountResponse {
  instagram_business_account?: {
    id: string;
    username: string;
  };
}

interface XTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface XUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
}

export function registerOAuthRoutes(app: Express) {
  app.post("/api/oauth/facebook/token", async (req: Request, res: Response) => {
    try {
      const { code, redirectUri } = req.body;

      if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
        return res.status(500).json({ 
          error: "Facebook OAuth not configured",
          message: "Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables"
        });
      }

      const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
      tokenUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
      tokenUrl.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
      tokenUrl.searchParams.append("redirect_uri", redirectUri);
      tokenUrl.searchParams.append("code", code);

      const tokenResponse = await fetch(tokenUrl.toString());
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return res.status(400).json({ error: "Failed to exchange token", details: error });
      }

      const tokenData: FacebookTokenResponse = await tokenResponse.json();

      const longLivedTokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
      longLivedTokenUrl.searchParams.append("grant_type", "fb_exchange_token");
      longLivedTokenUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
      longLivedTokenUrl.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
      longLivedTokenUrl.searchParams.append("fb_exchange_token", tokenData.access_token);

      const longLivedResponse = await fetch(longLivedTokenUrl.toString());
      const longLivedData: FacebookTokenResponse = longLivedResponse.ok
        ? await longLivedResponse.json()
        : tokenData;

      const userResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${longLivedData.access_token}`
      );
      if (!userResponse.ok) {
        return res.status(400).json({ error: "Failed to fetch user info" });
      }
      const userData: FacebookUserResponse = await userResponse.json();

      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture.type(large)&access_token=${longLivedData.access_token}`
      );
      const pagesData: FacebookPageResponse = pagesResponse.ok
        ? await pagesResponse.json()
        : { data: [] };

      let instagramAccount = null;
      for (const page of pagesData.data) {
        try {
          const igResponse = await fetch(
            `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{id,username}&access_token=${page.access_token}`
          );
          if (igResponse.ok) {
            const igData: InstagramAccountResponse = await igResponse.json();
            if (igData.instagram_business_account) {
              instagramAccount = {
                id: igData.instagram_business_account.id,
                username: igData.instagram_business_account.username,
                pageId: page.id,
                pageAccessToken: page.access_token,
              };
              break;
            }
          }
        } catch (e) {
          console.error("Failed to fetch Instagram account for page:", page.id);
        }
      }

      res.json({
        user: {
          id: `fb_${userData.id}`,
          name: userData.name,
          email: userData.email || "",
          avatar: userData.picture?.data?.url,
        },
        facebook: {
          accessToken: longLivedData.access_token,
          expiresIn: longLivedData.expires_in,
          userId: userData.id,
          pages: pagesData.data.map((page) => ({
            id: page.id,
            name: page.name,
            accessToken: page.access_token,
            picture: page.picture?.data?.url,
          })),
        },
        instagram: instagramAccount
          ? {
              id: instagramAccount.id,
              username: instagramAccount.username,
              pageId: instagramAccount.pageId,
              pageAccessToken: instagramAccount.pageAccessToken,
            }
          : null,
      });
    } catch (error) {
      console.error("Facebook OAuth error:", error);
      res.status(500).json({ error: "OAuth failed", details: String(error) });
    }
  });

  app.post("/api/oauth/x/token", async (req: Request, res: Response) => {
    try {
      const { code, redirectUri, codeVerifier } = req.body;

      if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
        return res.status(500).json({ 
          error: "X OAuth not configured",
          message: "Please set X_CLIENT_ID and X_CLIENT_SECRET environment variables"
        });
      }

      const tokenUrl = "https://api.twitter.com/2/oauth2/token";
      const authHeader = Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString("base64");

      const params = new URLSearchParams();
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", redirectUri);
      params.append("code_verifier", codeVerifier);

      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${authHeader}`,
        },
        body: params.toString(),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        return res.status(400).json({ error: "Failed to exchange token", details: error });
      }

      const tokenData: XTokenResponse = await tokenResponse.json();

      const userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        return res.status(400).json({ error: "Failed to fetch user info" });
      }

      const userData: XUserResponse = await userResponse.json();

      res.json({
        user: {
          id: `x_${userData.data.id}`,
          name: userData.data.name,
          username: userData.data.username,
          avatar: userData.data.profile_image_url,
        },
        x: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          userId: userData.data.id,
          username: userData.data.username,
        },
      });
    } catch (error) {
      console.error("X OAuth error:", error);
      res.status(500).json({ error: "OAuth failed", details: String(error) });
    }
  });

  app.post("/api/publish/facebook", async (req: Request, res: Response) => {
    try {
      const { pageId, pageAccessToken, message, mediaUrl } = req.body;

      if (!pageId || !pageAccessToken) {
        return res.status(400).json({ error: "Missing page credentials" });
      }

      let endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const params: Record<string, string> = {
        access_token: pageAccessToken,
        message: message,
      };

      if (mediaUrl) {
        endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
        params.url = mediaUrl;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(400).json({ error: "Failed to publish to Facebook", details: error });
      }

      const data = await response.json();
      res.json({ success: true, postId: data.id || data.post_id });
    } catch (error) {
      console.error("Facebook publish error:", error);
      res.status(500).json({ error: "Publish failed", details: String(error) });
    }
  });

  app.post("/api/publish/instagram", async (req: Request, res: Response) => {
    try {
      const { instagramAccountId, pageAccessToken, caption, mediaUrl } = req.body;

      if (!instagramAccountId || !pageAccessToken || !mediaUrl) {
        return res.status(400).json({ error: "Instagram requires a media URL" });
      }

      const containerResponse = await fetch(
        `https://graph.facebook.com/v19.0/${instagramAccountId}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: mediaUrl,
            caption: caption,
            access_token: pageAccessToken,
          }),
        }
      );

      if (!containerResponse.ok) {
        const error = await containerResponse.text();
        return res.status(400).json({ error: "Failed to create media container", details: error });
      }

      const containerData = await containerResponse.json();
      const containerId = containerData.id;

      await new Promise((resolve) => setTimeout(resolve, 5000));

      const publishResponse = await fetch(
        `https://graph.facebook.com/v19.0/${instagramAccountId}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: pageAccessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const error = await publishResponse.text();
        return res.status(400).json({ error: "Failed to publish to Instagram", details: error });
      }

      const publishData = await publishResponse.json();
      res.json({ success: true, postId: publishData.id });
    } catch (error) {
      console.error("Instagram publish error:", error);
      res.status(500).json({ error: "Publish failed", details: String(error) });
    }
  });

  app.post("/api/publish/x", async (req: Request, res: Response) => {
    try {
      const { accessToken, text, mediaId } = req.body;

      if (!accessToken) {
        return res.status(400).json({ error: "Missing access token" });
      }

      const tweetData: Record<string, unknown> = { text };
      if (mediaId) {
        tweetData.media = { media_ids: [mediaId] };
      }

      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tweetData),
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(400).json({ error: "Failed to post to X", details: error });
      }

      const data = await response.json();
      res.json({ success: true, postId: data.data?.id });
    } catch (error) {
      console.error("X publish error:", error);
      res.status(500).json({ error: "Publish failed", details: String(error) });
    }
  });

  app.get("/api/oauth/config", (_req: Request, res: Response) => {

    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    res.json({
      facebook: {
        configured: !!(FACEBOOK_APP_ID && FACEBOOK_APP_SECRET),
        appId: FACEBOOK_APP_ID || null,
      },
      x: {
        configured: !!(X_CLIENT_ID && X_CLIENT_SECRET),
        clientId: X_CLIENT_ID || null,
      },
    });
  });
}
