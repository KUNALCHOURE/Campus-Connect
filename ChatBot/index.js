require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const app = express();
const port = 5000;

// Configure OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
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

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    "role": "system", 
                    "content": "You are a helpful assistant." 
                },
                { 
                    "role": "user", 
                    "content": userMessage 
                }
            ],
            max_tokens: 150
        });

        const botResponse = completion.choices[0].message.content;
        
        res.json({
            response: botResponse
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Something went wrong'
        });
    }
});
// Add image upload endpoint
app.post('/upload-image', upload.single('image'), async (req, res) => {
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

// Add image analysis endpoint
app.post('/analyze-image', async (req, res) => {
  try {
    // Here you can add image analysis logic
    // For now, sending a simple response
    res.json({
      response: "I can see the image you uploaded. What would you like to know about it?"
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});