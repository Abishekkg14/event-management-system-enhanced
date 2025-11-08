const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GridFSBucket } = require('mongodb');

const router = express.Router();

// ensure tmp directory exists
const tmpDir = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// multer disk storage for large files
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, tmpDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

let bucket;
// initialize bucket after mongoose connects
mongoose.connection.once('open', () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'videos',
    chunkSizeBytes: 1024 * 1024 // 1MB chunks
  });
});

// Upload endpoint: POST /api/videos/upload
router.post('/upload', upload.single('file'), (req, res) => {
  console.log('Upload request received');
  
  if (!req.file) {
    console.error('No file in request');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!bucket) {
    console.error('GridFS bucket not initialized');
    return res.status(500).json({ error: 'Database not ready. Please try again.' });
  }

  const filePath = req.file.path;
  const filename = req.file.originalname;
  const contentType = req.file.mimetype || 'video/mp4';
  
  console.log('Uploading file:', filename, 'Size:', req.file.size, 'Type:', contentType);

  const uploadStream = bucket.openUploadStream(filename, {
    contentType,
    metadata: { uploadedAt: new Date() }
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(uploadStream)
    .on('error', (err) => {
      console.error('GridFS upload error:', err);
      try { fs.unlinkSync(filePath); } catch (e) {}
      res.status(500).json({ error: 'Upload failed: ' + err.message });
    })
    .on('finish', () => {
      try { fs.unlinkSync(filePath); } catch (e) {}
      console.log('Video uploaded to GridFS:', uploadStream.id.toString());
      res.json({ 
        message: 'Video uploaded successfully',
        fileId: uploadStream.id.toString(), 
        filename 
      });
    });
});

// List all videos: GET /api/videos/list
router.get('/list', async (req, res) => {
  try {
    const filesColl = mongoose.connection.db.collection('videos.files');
    const files = await filesColl.find({}).sort({ uploadDate: -1 }).toArray();
    res.json(files.map(f => ({
      id: f._id.toString(),
      filename: f.filename,
      size: f.length,
      uploadDate: f.uploadDate,
      contentType: f.contentType
    })));
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

// Stream endpoint with Range support: GET /api/videos/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const fileId = new mongoose.Types.ObjectId(id);
    const filesColl = mongoose.connection.db.collection('videos.files');
    const fileDoc = await filesColl.findOne({ _id: fileId });
    if (!fileDoc) return res.status(404).send('File not found');

    const fileSize = fileDoc.length;
    const contentType = fileDoc.contentType || 'video/mp4';
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (start >= fileSize || end >= fileSize) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
        return;
      }
      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      const downloadStream = bucket.openDownloadStream(fileId, { start, end: end + 1 });
      downloadStream.pipe(res).on('error', () => res.sendStatus(500));
      return;
    }

    // No range header — send full file
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType
    });
    bucket.openDownloadStream(fileId).pipe(res).on('error', () => res.sendStatus(500));
  } catch (err) {
    console.error('Stream error:', err);
    res.status(400).send('Invalid id');
  }
});

module.exports = router;
