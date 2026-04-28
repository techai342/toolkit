import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

const upload = multer({ storage: multer.memoryStorage() });

const imagekitConfig = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_8ulBaGE6HasMRTYenvVihqllUm8=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_DBHLVLfKVktC1UhaxnMNjJ++5sc=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/crv2lglsp',
};

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'divloq4oz',
  api_key: process.env.CLOUDINARY_API_KEY || '999667235587213',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'hKQ5Q6x6bdJOflp14Nk_S-MGrkw',
};

const imagekit = new ImageKit({
  publicKey: imagekitConfig.publicKey,
  privateKey: imagekitConfig.privateKey,
  urlEndpoint: imagekitConfig.urlEndpoint,
});

cloudinary.config(cloudinaryConfig);

export function createApp({ serveStatic = false }: { serveStatic?: boolean } = {}) {
  const app = express();
  app.use(express.json());

  app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!imagekitConfig.publicKey || !imagekitConfig.privateKey || !imagekitConfig.urlEndpoint) {
        return res.status(500).json({ error: 'ImageKit is not configured on server' });
      }

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

  app.post('/api/upload-media', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
        return res.status(500).json({ error: 'Cloudinary is not configured on server' });
      }

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

  if (serveStatic) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}
