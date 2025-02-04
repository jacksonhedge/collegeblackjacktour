import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read service account file
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../../serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin
const admin = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'collegeblackjacktour.appspot.com'
}, 'upload-server');

const storage = getStorage(admin);
const bucket = storage.bucket();
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Enable CORS
router.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:4001', 'http://localhost:4002', 'https://bankroll.live'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Handle file uploads
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Received upload request');
  try {
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    const path = req.body.path;
    if (!path) {
      console.log('No path provided in request');
      return res.status(400).json({ error: 'No path provided' });
    }

    console.log('Processing upload:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: path
    });

    // Create a new blob in the bucket
    const blob = bucket.file(path);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    // Handle errors during upload
    blobStream.on('error', (error) => {
      console.error('Upload error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ error: 'Unable to upload file', details: error.message });
    });

    // Handle successful upload
    blobStream.on('finish', async () => {
      console.log('Upload stream finished');
      try {
        // Make the file public
        console.log('Making file public');
        await blob.makePublic();
        
        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log('Generated public URL:', publicUrl);
        
        res.status(200).json({
          downloadURL: publicUrl
        });
      } catch (error) {
        console.error('Error making file public:', error);
        res.status(500).json({ error: 'Error making file public', details: error.message });
      }
    });

    // Write file to stream
    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Handle URL requests
router.get('/getUrl', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) {
      return res.status(400).json({ error: 'No path provided' });
    }

    const file = bucket.file(path);
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    res.status(200).json({
      downloadURL: publicUrl
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
