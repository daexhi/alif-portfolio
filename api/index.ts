import express from "express";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// API Proxy for TikTok with TikWM API
app.get("/api/tiktok-proxy", async (req, res) => {
  const { url: videoUrl } = req.query;

  if (!videoUrl || typeof videoUrl !== 'string') {
    return res.status(400).json({ error: "URL is required" });
  }

  // Clean URL: Extract the actual URL if it contains extra text (common in mobile sharing)
  let cleanedUrl = videoUrl;
  const urlMatches = videoUrl.match(/https?:\/\/[^\s]+/);
  if (urlMatches) {
    cleanedUrl = urlMatches[0];
  }

  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanedUrl)}`);
    const tikData = response.data;
    
    if (tikData.code !== 0) {
      return res.status(400).json({ error: tikData.msg || "Failed to fetch TikTok data" });
    }

    const result = {
      id: tikData.data.id,
      videoUrl: tikData.data.play,
      description: tikData.data.title,
      author: {
        nickname: tikData.data.author.nickname,
        unique_id: tikData.data.author.unique_id
      },
      cover: tikData.data.cover,
      duration: tikData.data.duration,
      stats: {
        views: tikData.data.play_count || 0,
        likes: tikData.data.digg_count || 0,
        comments: tikData.data.comment_count || 0,
        saves: tikData.data.collect_count || 0,
        shares: tikData.data.share_count || 0
      }
    };

    res.json(result);
  } catch (error: any) {
    console.error("TikTok Proxy Error:", error.message);
    res.status(500).json({ error: "Failed to fetch TikTok data" });
  }
});

// Media Proxy (for downloading/streaming videos to avoid CORS)
app.get("/api/video-proxy", async (req, res) => {
  const { url: mediaUrl } = req.query;

  if (!mediaUrl || typeof mediaUrl !== 'string') {
    return res.status(400).json({ error: "Media URL is required" });
  }

  try {
    const response = await axios.get(mediaUrl, { 
      responseType: 'arraybuffer',
      timeout: 25000, // 25 seconds timeout for download
      maxContentLength: 20 * 1024 * 1024, // 20MB limit for the download itself
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    });

    const contentType = (response.headers['content-type'] as string) || 'video/mp4';
    
    // Convert to base64 for Gemini if requested
    if (req.query.base64 === 'true') {
      const base64 = Buffer.from(response.data).toString('base64');
      
      // Vercel response limit is ~4.5MB. We should check if the base64 string is too large.
      // 3.5M characters is roughly 2.6MB, which is safe for Vercel's 4.5MB limit including overhead.
      if (base64.length > 3.5 * 1024 * 1024) {
        return res.status(413).json({ 
          error: "Video Terlalu Besar: Vercel membatasi ukuran data (4.5MB). Silakan coba video yang jauh lebih pendek (di bawah 15-20 detik)." 
        });
      }

      return res.json({
        data: base64,
        mimeType: contentType
      });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(response.data));
  } catch (error: any) {
    console.error("Media Proxy Error:", error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.code === 'ECONNABORTED' ? "Download timeout" : error.message;
    res.status(statusCode).json({ error: `Media Proxy Error: ${errorMessage} (${statusCode})` });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(process.cwd(), "public")));

    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    // In production (Vercel), Express only handles /api routes.
    // Static files and index.html are handled by vercel.json rewrites.
    
    if (import.meta.url === `file://${process.argv[1]}`) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running in production on port ${PORT}`);
      });
    }
  }
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
