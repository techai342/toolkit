import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import ImageKit from 'imagekit';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_8ulBaGE6HasMRTYenvVihqllUm8=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_DBHLVLfKVktC1UhaxnMNjJ++5sc=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/yalo', // A dummy endpoint if not provided
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // API Route for ImageKit Upload (Existing)
  app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const response = await imagekit.upload({
        file: req.file.buffer, // upload buffer
        fileName: req.file.originalname, // default name
        folder: '/yalo-assets', // storage folder in ImageKit
      });

      res.json({ url: response.url, fileId: response.fileId });
    } catch (error) {
      console.error('ImageKit Upload Error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  // API Route for Cloudinary Upload (New)
  app.post('/api/upload-media', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'media-assets', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      res.json({ url: (uploadResult as any).secure_url });
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
