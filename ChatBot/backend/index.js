const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

// Create uploads folder for storing images
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, 'image-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10000000 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Your existing chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        // Your existing chat logic here
        res.json({ response: "This is a response from the chatbot" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Image upload endpoint
app.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ 
            success: true, 
            imageUrl: imageUrl 
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Image analysis endpoint
app.post('/analyze-image', (req, res) => {
    try {
        const { imageUrl } = req.body;
        // Add your image analysis logic here
        res.json({
            response: "I can see the image you uploaded. What would you like to know about it?"
        });
    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});