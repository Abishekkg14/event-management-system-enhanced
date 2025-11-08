// server/import-video.js - Import video from tmp folder to GridFS
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-management';
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node import-video.js <path-to-video-file>');
  console.error('Example: node import-video.js ./tmp/sample.mp4');
  process.exit(1);
}

const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
  console.error('Error: File not found:', fullPath);
  process.exit(1);
}

async function importVideo() {
  try {
    await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { 
      bucketName: 'videos', 
      chunkSizeBytes: 1024 * 1024 
    });

    const filename = path.basename(fullPath);
    const uploadStream = bucket.openUploadStream(filename, { 
      contentType: 'video/mp4', 
      metadata: { importedAt: new Date() }
    });

    console.log('Importing:', fullPath);
    console.log('Filename:', filename);
    console.log('Please wait...');

    const readStream = fs.createReadStream(fullPath);
    
    readStream.pipe(uploadStream)
      .on('error', (err) => {
        console.error('Upload error:', err);
        process.exit(1);
      })
      .on('finish', () => {
        console.log('\n✓ Video imported successfully!');
        console.log('File ID:', uploadStream.id.toString());
        console.log('\nUse this ID in your frontend:');
        console.log(`  <video src="/api/videos/${uploadStream.id.toString()}" controls />`);
        mongoose.disconnect();
      });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

importVideo();
