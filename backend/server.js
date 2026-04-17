import express from "express";
import { createServer } from "http";
import { connectDB } from "./src/config/db.js";
import syncDatabase from "./src/services/relation_table.js";
import userRoutes from "./src/routes/user.route.js";

import adminRoutes from "./src/routes/admin.route.js"
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 Tell Express to serve BOTH folders


import cors from "cors";
import trainerRoutes from "./src/routes/trainer.route.js";

import courseRoutes from "./src/routes/course.route.js";
import cloudinaryConfig from "./src/config/clodinaryConfig.js";

import courseVideoRoutes from "./src/routes/course.lecture.video.route.js";

import publicCourseRoutes from "./src/routes/public.course.route.js"

import adminProductRoutes from "./src/routes/admin.product.route.js"
import adminCourseRoutes from "./src/routes/admin.course.route.js"
import publicProductRoutes from "./src/routes/public.product.route.js"
import userProductRoutes from "./src/routes/user.product.route.js"
import aiChatbotRoutes from "./src/routes/ai.chatbot.route.js"
import notificationRoutes from "./src/routes/notification.route.js"

import adminVerificationRoutes from "./src/routes/admin.trainer.verification.route.js"

import publicApprovedTrainerRoutes from './src/routes/public.trainerList.route.js'

import chatRoutes from './src/routes/chat.route.js'
import clientTrainerRoutes from './src/routes/clientTrainer.route.js'
import courseEnrollmentRoutes from './src/routes/courseEnrollment.route.js'
import { initializeSocket } from './src/socket/socket.js'

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();
cloudinaryConfig();


app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// const corsOptions = {
//     origin: '', 
//     methods: 'GET,POST', 
//     allowedHeaders: ['Content-Type', 'Authorization'] 
// };

// app.use(cors(corsOptions));

app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Test route
app.get("/", (req, res) => {
  res.send(`Server is running on port ${PORT}`);
});

// API routes
app.use("/api", userRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/trainer/courses",courseRoutes)
app.use("/api/trainer/course/lecture",courseVideoRoutes)

app.use("/api/public/courses",publicCourseRoutes)

app.use("/api/admin",adminRoutes)
app.use("/api/admin/products", adminProductRoutes)
app.use("/api/admin/courses", adminCourseRoutes)
app.use("/api/public/products", publicProductRoutes)

app.use('/api/admin/trainer',adminVerificationRoutes)

app.use('/api/public/trainer',publicApprovedTrainerRoutes);

app.use('/api/chat', chatRoutes);
app.use('/api', aiChatbotRoutes);
app.use('/api/notifications', notificationRoutes);

// Client-Trainer management routes
app.use('/api/client-trainer', clientTrainerRoutes);

// Course enrollment routes (user enrolls in courses)
app.use('/api/enrollment', courseEnrollmentRoutes);
app.use('/api/user/products', userProductRoutes);



const startServer = async () => {
  try {
    await connectDB(); 
    await syncDatabase(); // make sure this 
    
    // Create HTTP server and initialize Socket.io
    const httpServer = createServer(app);
    initializeSocket(httpServer);
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
