// backend/src/config/multer.js
// UPDATED: Increased limits to support multiple image uploads

const multer = require('multer');
const path = require('path');

// Store files in memory temporarily
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size per file
    files: 8                    // NEW: Maximum 8 files per request
  }
});

module.exports = upload;