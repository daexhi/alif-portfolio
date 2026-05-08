import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
export default app;

async function startServer() {
  const PORT = 3000;

  app.use(express.json());
  
  // Custom middleware for MP4 files to ensure correct MIME type and range support
  app.get('*.mp4', (req, res, next) => {
    res.setHeader('Content-Type', 'video/mp4');
    // Ensure the file exists before letting express.static handle it with these headers
    next();
  });

  app.use(express.static(path.join(process.cwd(), "public")));

  // API Proxy for TikTok with TikWM API
  app.get("/api/tiktok-proxy", async (req, res) => {
    const { url: videoUrl } = req.query;
    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).json({ error: "TikTok URL is required" });
    }

    try {
      const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = response.data;

      if (data.code !== 0) {
        return res.status(400).json({ error: data.msg || 'Failed to fetch TikTok data' });
      }

      // Map TikWM data to the structure the frontend expects
      const result = {
        id: data.data.id,
        title: data.data.title,
        description: data.data.title,
        cover: data.data.cover,
        videoUrl: data.data.play, // No-watermark video URL
        audioUrl: data.data.music,
        author: {
          nickname: data.data.author.nickname,
          uniqueId: data.data.author.unique_id,
          avatar: data.data.author.avatar
        },
        stats: {
          likes: data.data.digg_count,
          views: data.data.play_count,
          comments: data.data.comment_count,
          shares: data.data.share_count,
          saves: data.data.collect_count,
        }
      };

      res.json(result);
    } catch (error: any) {
      console.error('TikTok API Error:', error.message);
      res.status(500).json({ error: 'Failed to fetch TikTok data' });
    }
  });

  // Video Proxy to bypass TikTok hotlinking restrictions
  app.get("/api/video-proxy", async (req, res) => {
    const { url: videoUrl } = req.query;
    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).send("URL required");
    }

    try {
      const response = await axios.get(videoUrl, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.tiktok.com/'
        }
      });

      const contentType = response.headers['content-type'];
      res.setHeader('Content-Type', typeof contentType === 'string' ? contentType : 'video/mp4');
      
      // Transfer relevant headers
      if (response.headers['content-length']) res.setHeader('Content-Length', String(response.headers['content-length']));
      if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', String(response.headers['accept-ranges']));
      
      response.data.pipe(res);
    } catch (error: any) {
      console.error('Video Stream Error:', error.message);
      res.status(500).send('Failed to stream video');
    }
  });

  // Proxy to fetch media as base64 for Gemini
  app.get('/api/proxy-media', async (req, res) => {
    const { url: mediaUrl } = req.query;
    if (!mediaUrl || typeof mediaUrl !== 'string') {
      return res.status(400).json({ error: 'Media URL is required' });
    }

    try {
      const response = await axios.get(mediaUrl, { 
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.tiktok.com/'
        }
      });
      const contentType = response.headers['content-type'];
      const base64 = Buffer.from(response.data).toString('base64');
      
      res.json({
        mimeType: contentType,
        data: base64
      });
    } catch (error: any) {
      console.error('Proxy Media Error:', error.message);
      res.status(500).json({ error: 'Failed to proxy media' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Initialize the server setup but don't block the export
startServer().catch(err => {
  console.error("Failed to start server:", err);
});
