import http from "../http/response.js";
import * as clientTrainerService from "../services/clientTrainer.service.js";

// ==================== CLIENT ENROLLMENT ====================

// User requests to become a client
export const requestEnrollment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { trainerId, requestMessage } = req.body;

        if (!trainerId) {
            return http.badRequest(res, "Trainer ID is required");
        }

        const enrollment = await clientTrainerService.requestEnrollmentService(
            userId, 
            trainerId, 
            requestMessage
        );

        return http.created(res, "Enrollment request sent successfully", enrollment);
    } catch (err) {
        console.error("requestEnrollment error:", err);
        return http.badRequest(res, err.message);
    }
};

// Trainer gets enrollment requests
export const getEnrollmentRequests = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { status } = req.query;

        const requests = await clientTrainerService.getEnrollmentRequestsService(trainerId, status);
        return http.ok(res, "Enrollment requests fetched", requests);
    } catch (err) {
        console.error("getEnrollmentRequests error:", err);
        return http.serverError(res, err.message);
    }
};

// Trainer accepts enrollment
export const acceptEnrollment = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { enrollmentId } = req.params;

        const enrollment = await clientTrainerService.acceptEnrollmentService(enrollmentId, trainerId);
        return http.ok(res, "Enrollment accepted", enrollment);
    } catch (err) {
        console.error("acceptEnrollment error:", err);
        return http.badRequest(res, err.message);
    }
};

// Trainer rejects enrollment
export const rejectEnrollment = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { enrollmentId } = req.params;
        const { rejectionReason } = req.body;

        const enrollment = await clientTrainerService.rejectEnrollmentService(
            enrollmentId, 
            trainerId, 
            rejectionReason
        );
        return http.ok(res, "Enrollment rejected", enrollment);
    } catch (err) {
        console.error("rejectEnrollment error:", err);
        return http.badRequest(res, err.message);
    }
};

// Get trainer's clients
export const getTrainerClients = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const clients = await clientTrainerService.getTrainerClientsService(trainerId);
        return http.ok(res, "Clients fetched", clients);
    } catch (err) {
        console.error("getTrainerClients error:", err);
        return http.serverError(res, err.message);
    }
};

// Get user's enrollments
export const getUserEnrollments = async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollments = await clientTrainerService.getUserEnrollmentsService(userId);
        return http.ok(res, "Enrollments fetched", enrollments);
    } catch (err) {
        console.error("getUserEnrollments error:", err);
        return http.serverError(res, err.message);
    }
};

// Check enrollment status
export const checkEnrollmentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { trainerId } = req.params;

        const enrollment = await clientTrainerService.checkEnrollmentStatusService(userId, trainerId);
        return http.ok(res, "Enrollment status", { enrollment });
    } catch (err) {
        console.error("checkEnrollmentStatus error:", err);
        return http.serverError(res, err.message);
    }
};

// ==================== TODO MANAGEMENT ====================

// Create todo
export const createTodo = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { title, description, dueDate, priority } = req.body;

        if (!title) {
            return http.badRequest(res, "Title is required");
        }

        // Handle uploaded files
        const resources = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                let resourceType = 'other';
                if (file.mimetype.includes('pdf')) resourceType = 'pdf';
                else if (file.mimetype.includes('video')) resourceType = 'video';
                else if (file.mimetype.includes('image')) resourceType = 'image';
                else if (file.mimetype.includes('document') || file.mimetype.includes('word')) resourceType = 'document';

                resources.push({
                    resourceType,
                    fileName: file.originalname,
                    filePath: file.path,
                    fileSize: file.size,
                    mimeType: file.mimetype
                });
            }
        }

        const todo = await clientTrainerService.createTodoService(
            trainerId,
            { title, description, dueDate, priority },
            resources
        );

        return http.created(res, "Todo created successfully", todo);
    } catch (err) {
        console.error("createTodo error:", err);
        return http.serverError(res, err.message);
    }
};

// Get trainer's todos
export const getTrainerTodos = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const todos = await clientTrainerService.getTrainerTodosService(trainerId);
        return http.ok(res, "Todos fetched", todos);
    } catch (err) {
        console.error("getTrainerTodos error:", err);
        return http.serverError(res, err.message);
    }
};

// Get single todo
export const getTodoById = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { todoId } = req.params;

        const todo = await clientTrainerService.getTodoByIdService(todoId, trainerId);
        if (!todo) {
            return http.notFound(res, "Todo not found");
        }

        return http.ok(res, "Todo fetched", todo);
    } catch (err) {
        console.error("getTodoById error:", err);
        return http.serverError(res, err.message);
    }
};

// Update todo
export const updateTodo = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { todoId } = req.params;
        const updateData = req.body;

        const todo = await clientTrainerService.updateTodoService(todoId, trainerId, updateData);
        return http.ok(res, "Todo updated", todo);
    } catch (err) {
        console.error("updateTodo error:", err);
        return http.badRequest(res, err.message);
    }
};

// Delete todo
export const deleteTodo = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { todoId } = req.params;

        await clientTrainerService.deleteTodoService(todoId, trainerId);
        return http.ok(res, "Todo deleted");
    } catch (err) {
        console.error("deleteTodo error:", err);
        return http.badRequest(res, err.message);
    }
};

// Add resource to todo
export const addTodoResource = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { todoId } = req.params;

        if (!req.file) {
            return http.badRequest(res, "File is required");
        }

        let resourceType = 'other';
        if (req.file.mimetype.includes('pdf')) resourceType = 'pdf';
        else if (req.file.mimetype.includes('video')) resourceType = 'video';
        else if (req.file.mimetype.includes('image')) resourceType = 'image';
        else if (req.file.mimetype.includes('document') || req.file.mimetype.includes('word')) resourceType = 'document';

        const resource = await clientTrainerService.addTodoResourceService(todoId, trainerId, {
            resourceType,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });

        return http.created(res, "Resource added", resource);
    } catch (err) {
        console.error("addTodoResource error:", err);
        return http.badRequest(res, err.message);
    }
};

// Delete resource
export const deleteTodoResource = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { resourceId } = req.params;

        await clientTrainerService.deleteTodoResourceService(resourceId, trainerId);
        return http.ok(res, "Resource deleted");
    } catch (err) {
        console.error("deleteTodoResource error:", err);
        return http.badRequest(res, err.message);
    }
};

// ==================== TODO ASSIGNMENT ====================

// Assign todo to users
export const assignTodoToUsers = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { todoId } = req.params;
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return http.badRequest(res, "User IDs are required");
        }

        const result = await clientTrainerService.assignTodoToUsersService(todoId, trainerId, userIds);
        return http.ok(res, result.message, result);
    } catch (err) {
        console.error("assignTodoToUsers error:", err);
        return http.badRequest(res, err.message);
    }
};

// Get todo assignments
export const getTodoAssignments = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { todoId } = req.params;

        const assignments = await clientTrainerService.getTodoAssignmentsService(todoId, trainerId);
        return http.ok(res, "Assignments fetched", assignments);
    } catch (err) {
        console.error("getTodoAssignments error:", err);
        return http.badRequest(res, err.message);
    }
};

// Mark assignment complete
export const markAssignmentComplete = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { assignmentId } = req.params;
        const { remarks } = req.body;

        const assignment = await clientTrainerService.markAssignmentCompleteService(
            assignmentId, 
            trainerId, 
            remarks
        );
        return http.ok(res, "Assignment marked as complete", assignment);
    } catch (err) {
        console.error("markAssignmentComplete error:", err);
        return http.badRequest(res, err.message);
    }
};

// Request revision
export const requestRevision = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { assignmentId } = req.params;
        const { remarks } = req.body;

        const assignment = await clientTrainerService.requestRevisionService(
            assignmentId, 
            trainerId, 
            remarks
        );
        return http.ok(res, "Revision requested", assignment);
    } catch (err) {
        console.error("requestRevision error:", err);
        return http.badRequest(res, err.message);
    }
};

// Give feedback on submission
export const giveFeedback = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const { submissionId } = req.params;
        const { feedback } = req.body;

        if (!feedback) {
            return http.badRequest(res, "Feedback is required");
        }

        const submission = await clientTrainerService.giveFeedbackService(submissionId, trainerId, feedback);
        return http.ok(res, "Feedback given", submission);
    } catch (err) {
        console.error("giveFeedback error:", err);
        return http.badRequest(res, err.message);
    }
};

// ==================== USER SIDE ====================

// Get user's assigned todos
export const getUserAssignedTodos = async (req, res) => {
    try {
        const userId = req.user.id;
        const assignments = await clientTrainerService.getUserAssignedTodosService(userId);
        return http.ok(res, "Assigned todos fetched", assignments);
    } catch (err) {
        console.error("getUserAssignedTodos error:", err);
        return http.serverError(res, err.message);
    }
};

// Get single assignment
export const getUserAssignment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { assignmentId } = req.params;

        const assignment = await clientTrainerService.getUserAssignmentService(assignmentId, userId);
        if (!assignment) {
            return http.notFound(res, "Assignment not found");
        }

        return http.ok(res, "Assignment fetched", assignment);
    } catch (err) {
        console.error("getUserAssignment error:", err);
        return http.serverError(res, err.message);
    }
};

// Submit progress
export const submitProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { assignmentId } = req.params;
        const { notes, content } = req.body;

        let submissionData = {
            notes
        };

        if (req.file) {
            submissionData.submissionType = req.file.mimetype.includes('video') ? 'video' : 'image';
            submissionData.filePath = req.file.path;
            submissionData.fileName = req.file.originalname;
        } else if (content) {
            submissionData.submissionType = 'text';
            submissionData.content = content;
        } else {
            return http.badRequest(res, "File or text content is required");
        }

        const submission = await clientTrainerService.submitProgressService(
            assignmentId, 
            userId, 
            submissionData
        );
        return http.created(res, "Progress submitted", submission);
    } catch (err) {
        console.error("submitProgress error:", err);
        return http.badRequest(res, err.message);
    }
};

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { assignmentId } = req.params;
        const { status } = req.body;

        if (!['pending', 'in_progress'].includes(status)) {
            return http.badRequest(res, "Invalid status. Use 'pending' or 'in_progress'");
        }

        const assignment = await clientTrainerService.updateAssignmentStatusService(
            assignmentId, 
            userId, 
            status
        );
        return http.ok(res, "Status updated", assignment);
    } catch (err) {
        console.error("updateAssignmentStatus error:", err);
        return http.badRequest(res, err.message);
    }
};

// ==================== DASHBOARD STATS ====================

// User dashboard stats
export const getUserDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await clientTrainerService.getUserDashboardStatsService(userId);
        return http.ok(res, "User stats fetched", stats);
    } catch (err) {
        console.error("getUserDashboardStats error:", err);
        return http.serverError(res, err.message);
    }
};

// Trainer dashboard stats
export const getTrainerDashboardStats = async (req, res) => {
    try {
        const trainerId = req.user.id;
        const stats = await clientTrainerService.getTrainerDashboardStatsService(trainerId);
        return http.ok(res, "Trainer stats fetched", stats);
    } catch (err) {
        console.error("getTrainerDashboardStats error:", err);
        return http.serverError(res, err.message);
    }
};

// ==================== ADMIN ====================

// Get all assignments with filters
export const getAllAssignmentsAdmin = async (req, res) => {
    try {
        const { page, limit, search, status, fromDate, toDate, trainerId, userId } = req.query;

        const result = await clientTrainerService.getAllAssignmentsAdminService({
            page,
            limit,
            search,
            status,
            fromDate,
            toDate,
            trainerId,
            userId
        });

        return http.ok(res, "Assignments fetched", result);
    } catch (err) {
        console.error("getAllAssignmentsAdmin error:", err);
        return http.serverError(res, err.message);
    }
};

// Get admin stats
export const getAdminStats = async (req, res) => {
    try {
        const stats = await clientTrainerService.getAdminStatsService();
        return http.ok(res, "Admin stats fetched", stats);
    } catch (err) {
        console.error("getAdminStats error:", err);
        return http.serverError(res, err.message);
    }
};
