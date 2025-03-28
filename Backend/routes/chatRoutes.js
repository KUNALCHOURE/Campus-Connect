import express from 'express';
import { chat, uploadImage, analyzeImage } from '../controllers/chatController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Chat endpoint
router.post('/chat', chat);

// Image upload endpoint
router.post('/upload-image', upload.single('image'), uploadImage);

// Image analysis endpoint
router.post('/analyze-image', analyzeImage);

export default router; 