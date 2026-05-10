import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// API Proxy for TikTok with TikWM API
app.get("/api/tiktok-proxy", async (req, res) => {
  const { url: videoUrl } = req.query;

  if (!videoUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.get(`https://www.tikwm.com/api/?url=${videoUrl}`);
    res.json(response.data);
  } catch (error: any) {
    console.error("TikTok Proxy Error:", error.message);
    res.status(500).json({ error: "Failed to fetch TikTok data" });
  }
});

// Media Proxy (for downloading/streaming videos to avoid CORS)
app.get("/api/proxy-media", async (req, res) => {
  const { url: mediaUrl } = req.query;

  if (!mediaUrl || typeof mediaUrl !== 'string') {
    return res.status(400).json({ error: "Media URL is required" });
  }

  try {
    const response = await axios.get(mediaUrl, { 
      responseType: 'arraybuffer',
      maxContentLength: 10 * 1024 * 1024, // 10MB limit
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const contentType = (response.headers['content-type'] as string) || 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Convert to base64 for Gemini if requested
    if (req.query.base64 === 'true') {
      const base64 = Buffer.from(response.data).toString('base64');
      return res.json({
        data: base64,
        mimeType: contentType
      });
    }

    res.send(Buffer.from(response.data));
  } catch (error: any) {
    console.error("Media Proxy Error:", error.message);
    res.status(500).json({ error: "Failed to proxy media" });
  }
});

// Gemini Analysis Endpoint
app.post('/api/analyze-video', async (req, res) => {
  const { prompt, videoData, mimeType } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key is not configured on the server." });
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: videoData,
              mimeType: mimeType || "video/mp4"
            }
          }
        ]
      }
    });

    const text = result.text;
    
    // Attempt to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.json({ text });
      }
    } catch (e) {
      res.json({ text });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ error: `AI Generation failed: ${error.message}` });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(process.cwd(), "public")));

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
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
