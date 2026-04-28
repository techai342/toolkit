import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed for /api/upload'));
      return;
    }
    cb(null, true);
  },
});

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const imagekitConfig = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
};

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

export function createApp({ serveStatic = false }: { serveStatic?: boolean } = {}) {
  const app = express();
  app.use(express.json());

  app.post('/api/upload', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!imagekitConfig.publicKey || !imagekitConfig.privateKey || !imagekitConfig.urlEndpoint) {
        return res.status(500).json({ error: 'ImageKit is not configured on server' });
      }

      const imagekit = new ImageKit({
        publicKey: imagekitConfig.publicKey,
        privateKey: imagekitConfig.privateKey,
        urlEndpoint: imagekitConfig.urlEndpoint,
      });

      const response = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: '/yalo-assets',
      });

      res.json({ url: response.url, fileId: response.fileId });
    } catch (error) {
      console.error('ImageKit Upload Error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  app.post('/api/upload-media', mediaUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
        return res.status(500).json({ error: 'Cloudinary is not configured on server' });
      }

      cloudinary.config(cloudinaryConfig);

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'media-assets', resource_type: 'auto' }, (error, result) => {
            if (error || !result) {
              reject(error || new Error('Cloudinary upload failed'));
              return;
            }
            resolve({ secure_url: result.secure_url });
          })
          .end(req.file.buffer);
      });

      res.json({ url: uploadResult.secure_url });
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });

  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Please upload a smaller file.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (err instanceof Error) {
      console.error('Unhandled API error:', err);
      if (req.path.startsWith('/api/')) {
        return res.status(500).json({ error: err.message || 'Unexpected server error' });
      }
    }

    return next(err);
  });

  if (serveStatic) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
