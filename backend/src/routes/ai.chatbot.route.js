import express from 'express';
import { chatbotController } from '../controllers/ai.chatbot.controller.js';

const router = express.Router();

router.post('/chatbot', chatbotController);

export default router;