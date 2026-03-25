import express from "express";
import { authMiddleware, trainerAuthMiddleware, adminAuthMiddleware } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as controller from "../controllers/clientTrainer.controller.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/todos';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const progressStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/progress';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

const progressUpload = multer({
    storage: progressStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only video and image files are allowed'), false);
        }
    }
});

// ==================== USER ENROLLMENT ROUTES ====================

// User requests to become a client
router.post("/enrollment/request", authMiddleware, controller.requestEnrollment);

// User gets their enrollments
router.get("/enrollment/my-enrollments", authMiddleware, controller.getUserEnrollments);

// Check enrollment status with a trainer
router.get("/enrollment/status/:trainerId", authMiddleware, controller.checkEnrollmentStatus);

// ==================== TRAINER ENROLLMENT ROUTES ====================

// Trainer gets enrollment requests
router.get("/trainer/enrollment-requests", authMiddleware, trainerAuthMiddleware, controller.getEnrollmentRequests);

// Trainer accepts enrollment
router.put("/trainer/enrollment/:enrollmentId/accept", authMiddleware, trainerAuthMiddleware, controller.acceptEnrollment);

// Trainer rejects enrollment
router.put("/trainer/enrollment/:enrollmentId/reject", authMiddleware, trainerAuthMiddleware, controller.rejectEnrollment);

// Trainer gets their clients
router.get("/trainer/clients", authMiddleware, trainerAuthMiddleware, controller.getTrainerClients);

// ==================== TRAINER TODO ROUTES ====================

// Create todo with resources
router.post("/trainer/todos", authMiddleware, trainerAuthMiddleware, upload.array('resources', 10), controller.createTodo);

// Get trainer's todos
router.get("/trainer/todos", authMiddleware, trainerAuthMiddleware, controller.getTrainerTodos);

// Get single todo
router.get("/trainer/todos/:todoId", authMiddleware, trainerAuthMiddleware, controller.getTodoById);

// Update todo
router.put("/trainer/todos/:todoId", authMiddleware, trainerAuthMiddleware, controller.updateTodo);

// Delete todo
router.delete("/trainer/todos/:todoId", authMiddleware, trainerAuthMiddleware, controller.deleteTodo);

// Add resource to todo
router.post("/trainer/todos/:todoId/resources", authMiddleware, trainerAuthMiddleware, upload.single('resource'), controller.addTodoResource);

// Delete resource
router.delete("/trainer/resources/:resourceId", authMiddleware, trainerAuthMiddleware, controller.deleteTodoResource);

// ==================== TRAINER ASSIGNMENT ROUTES ====================

// Assign todo to users
router.post("/trainer/todos/:todoId/assign", authMiddleware, trainerAuthMiddleware, controller.assignTodoToUsers);

// Get todo assignments
router.get("/trainer/todos/:todoId/assignments", authMiddleware, trainerAuthMiddleware, controller.getTodoAssignments);

// Mark assignment complete
router.put("/trainer/assignments/:assignmentId/complete", authMiddleware, trainerAuthMiddleware, controller.markAssignmentComplete);

// Request revision
router.put("/trainer/assignments/:assignmentId/revision", authMiddleware, trainerAuthMiddleware, controller.requestRevision);

// Give feedback on submission
router.put("/trainer/submissions/:submissionId/feedback", authMiddleware, trainerAuthMiddleware, controller.giveFeedback);

// Trainer dashboard stats
router.get("/trainer/dashboard/stats", authMiddleware, trainerAuthMiddleware, controller.getTrainerDashboardStats);

// ==================== USER TODO ROUTES ====================

// Get user's assigned todos
router.get("/user/todos", authMiddleware, controller.getUserAssignedTodos);

// Get single assignment
router.get("/user/todos/:assignmentId", authMiddleware, controller.getUserAssignment);

// Submit progress
router.post("/user/todos/:assignmentId/submit", authMiddleware, progressUpload.single('file'), controller.submitProgress);

// Update assignment status
router.put("/user/todos/:assignmentId/status", authMiddleware, controller.updateAssignmentStatus);

// User dashboard stats
router.get("/user/dashboard/stats", authMiddleware, controller.getUserDashboardStats);

// ==================== ADMIN ROUTES ====================

// Get all assignments with filters and pagination
router.get("/admin/assignments", authMiddleware, adminAuthMiddleware, controller.getAllAssignmentsAdmin);

// Get admin stats
router.get("/admin/stats", authMiddleware, adminAuthMiddleware, controller.getAdminStats);

export default router;
