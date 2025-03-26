const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Example = require('./example.model');
const { FileSystemHelper } = require('../../helpers');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Storage - Destination:', { file: file });
    FileSystemHelper.createDirectory("uploads")
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    console.log('Storage - Filename:', { 
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  console.log('FileFilter:', {
    mimetype: file.mimetype,
    originalname: file.originalname,
    size: file.size
  });
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Route for creating/updating example with image upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload Request:', {
      file: req.file,
      body: req.body
    });
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Create or update example document
    const exampleData = {
      ...req.body,
      image: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    };

    let example;
    if (req.body._id) {
      // Update existing document
      example = await Example.findByIdAndUpdate(
        req.body._id,
        exampleData,
        { new: true }
      );
    } else {
      // Create new document
      example = await Example.create(exampleData);
    }

    res.status(200).json({
      success: true,
      data: example
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Route for getting all examples
router.get('/', async (req, res) => {
  try {
    const examples = await Example.find();
    const HOST = process.env.HOST || 'localhost';
    const PORT = process.env.PORT || 5000;
    
    // Add full URL to image paths
    const examplesWithFullUrls = examples.map(example => {
      const doc = example.toObject();
      if (doc.image && doc.image.path) {
        doc.image.path = `http://${HOST}:${PORT}/${doc.image.path.replace(/\\/g, '/')}`;
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      data: examplesWithFullUrls
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

module.exports = router;