import ClientEnrollment from "../models/clientEnrollment.model.js";
import Todo from "../models/todo.model.js";
import TodoResource from "../models/todoResource.model.js";
import UserTodoAssignment from "../models/userTodoAssignment.model.js";
import ProgressSubmission from "../models/progressSubmission.model.js";
import user from "../models/usersModels.js";
import Trainer from "../models/TrainerModels.js";
import { Op } from "sequelize";

// ==================== CLIENT ENROLLMENT ====================

// User requests to become a client of a trainer
export const requestEnrollmentService = async (userId, trainerId, requestMessage) => {
    // Check if already enrolled or pending
    const existing = await ClientEnrollment.findOne({
        where: {
            userId,
            trainerId,
            status: { [Op.in]: ['pending', 'accepted'] }
        }
    });

    if (existing) {
        throw new Error(existing.status === 'accepted' 
            ? 'You are already enrolled with this trainer' 
            : 'You already have a pending request with this trainer');
    }

    const enrollment = await ClientEnrollment.create({
        userId,
        trainerId,
        requestMessage,
        status: 'pending'
    });

    return enrollment;
};

// Trainer gets all enrollment requests
export const getEnrollmentRequestsService = async (trainerId, status = null) => {
    const where = { trainerId };
    if (status) {
        where.status = status;
    }

    const requests = await ClientEnrollment.findAll({
        where,
        include: [{
            model: user,
            as: 'user',
            attributes: ['id', 'username', 'email', 'contact']
        }],
        order: [['createdAt', 'DESC']]
    });

    return requests;
};

// Trainer accepts enrollment
export const acceptEnrollmentService = async (enrollmentId, trainerId) => {
    const enrollment = await ClientEnrollment.findOne({
        where: { id: enrollmentId, trainerId, status: 'pending' }
    });

    if (!enrollment) {
        throw new Error('Enrollment request not found or already processed');
    }

    enrollment.status = 'accepted';
    enrollment.acceptedAt = new Date();
    await enrollment.save();

    return enrollment;
};

// Trainer rejects enrollment
export const rejectEnrollmentService = async (enrollmentId, trainerId, rejectionReason) => {
    const enrollment = await ClientEnrollment.findOne({
        where: { id: enrollmentId, trainerId, status: 'pending' }
    });

    if (!enrollment) {
        throw new Error('Enrollment request not found or already processed');
    }

    enrollment.status = 'rejected';
    enrollment.rejectedAt = new Date();
    enrollment.rejectionReason = rejectionReason;
    await enrollment.save();

    return enrollment;
};

// Get trainer's accepted clients
export const getTrainerClientsService = async (trainerId) => {
    const clients = await ClientEnrollment.findAll({
        where: { trainerId, status: 'accepted' },
        include: [{
            model: user,
            as: 'user',
            attributes: ['id', 'username', 'email', 'contact']
        }],
        order: [['acceptedAt', 'DESC']]
    });
    console.log("This is clients",clients.User)

    return clients;
};

// Get user's enrollments (to see their trainers)
export const getUserEnrollmentsService = async (userId) => {
    const enrollments = await ClientEnrollment.findAll({
        where: { userId },
        include: [{
            model: Trainer,
            as: 'trainer',
            attributes: ['id', 'specialization', 'type'],
            include: [{
                model: user,
                attributes: ['id', 'username', 'email']
            }]
        }],
        order: [['createdAt', 'DESC']]
    });

    return enrollments;
};

// Check if user is enrolled with trainer
export const checkEnrollmentStatusService = async (userId, trainerId) => {
    const enrollment = await ClientEnrollment.findOne({
        where: { userId, trainerId }
    });

    return enrollment;
};

// ==================== TODO MANAGEMENT ====================

// Create a todo
export const createTodoService = async (trainerId, todoData, resources = []) => {
    const todo = await Todo.create({
        trainerId,
        title: todoData.title,
        description: todoData.description,
        dueDate: todoData.dueDate,
        priority: todoData.priority || 'medium'
    });

    // Add resources if any
    if (resources.length > 0) {
        const resourceRecords = resources.map(r => ({
            todoId: todo.id,
            resourceType: r.resourceType,
            fileName: r.fileName,
            filePath: r.filePath,
            fileSize: r.fileSize,
            mimeType: r.mimeType
        }));
        await TodoResource.bulkCreate(resourceRecords);
    }

    // Fetch with resources
    const todoWithResources = await Todo.findByPk(todo.id, {
        include: [{ model: TodoResource, as: 'resources' }]
    });

    return todoWithResources;
};

// Get trainer's todos
export const getTrainerTodosService = async (trainerId) => {
    const todos = await Todo.findAll({
        where: { trainerId },
        include: [
            { model: TodoResource, as: 'resources' },
            { 
                model: UserTodoAssignment, 
                as: 'assignments',
                include: [{
                    model: user,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                }]
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return todos;
};

// Get single todo
export const getTodoByIdService = async (todoId, trainerId) => {
    const todo = await Todo.findOne({
        where: { id: todoId, trainerId },
        include: [
            { model: TodoResource, as: 'resources' },
            { 
                model: UserTodoAssignment, 
                as: 'assignments',
                include: [
                    {
                        model: user,
                        as: 'user',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: ProgressSubmission,
                        as: 'submissions'
                    }
                ]
            }
        ]
    });

    return todo;
};

// Update todo
export const updateTodoService = async (todoId, trainerId, updateData) => {
    const todo = await Todo.findOne({
        where: { id: todoId, trainerId }
    });

    if (!todo) {
        throw new Error('Todo not found');
    }

    await todo.update(updateData);
    return todo;
};

// Delete todo
export const deleteTodoService = async (todoId, trainerId) => {
    const todo = await Todo.findOne({
        where: { id: todoId, trainerId }
    });

    if (!todo) {
        throw new Error('Todo not found');
    }

    await todo.destroy();
    return { message: 'Todo deleted successfully' };
};

// Add resource to todo
export const addTodoResourceService = async (todoId, trainerId, resourceData) => {
    const todo = await Todo.findOne({
        where: { id: todoId, trainerId }
    });

    if (!todo) {
        throw new Error('Todo not found');
    }

    const resource = await TodoResource.create({
        todoId,
        ...resourceData
    });

    return resource;
};

// Delete resource
export const deleteTodoResourceService = async (resourceId, trainerId) => {
    const resource = await TodoResource.findByPk(resourceId, {
        include: [{
            model: Todo,
            as: 'todo',
            where: { trainerId }
        }]
    });

    if (!resource) {
        throw new Error('Resource not found');
    }

    await resource.destroy();
    return { message: 'Resource deleted successfully' };
};

// ==================== TODO ASSIGNMENT ====================

// Assign todo to multiple users
export const assignTodoToUsersService = async (todoId, trainerId, userIds) => {
    const todo = await Todo.findOne({
        where: { id: todoId, trainerId }
    });

    if (!todo) {
        throw new Error('Todo not found');
    }

    // Verify all users are enrolled with this trainer
    const enrolledUsers = await ClientEnrollment.findAll({
        where: {
            trainerId,
            userId: { [Op.in]: userIds },
            status: 'accepted'
        }
    });

    const enrolledUserIds = enrolledUsers.map(e => e.userId);
    const invalidUsers = userIds.filter(id => !enrolledUserIds.includes(id));

    if (invalidUsers.length > 0) {
        throw new Error(`Some users are not enrolled with you: ${invalidUsers.join(', ')}`);
    }

    // Create assignments (skip if already assigned)
    const existingAssignments = await UserTodoAssignment.findAll({
        where: { todoId, userId: { [Op.in]: userIds } }
    });
    const alreadyAssignedIds = existingAssignments.map(a => a.userId);
    const newUserIds = userIds.filter(id => !alreadyAssignedIds.includes(id));

    if (newUserIds.length > 0) {
        const assignments = newUserIds.map(userId => ({
            todoId,
            userId,
            status: 'pending',
            assignedAt: new Date(),
            isNotified: false
        }));
        await UserTodoAssignment.bulkCreate(assignments);
    }

    return { 
        message: `Todo assigned to ${newUserIds.length} users`,
        alreadyAssigned: alreadyAssignedIds.length
    };
};

// Get assignments for a todo
export const getTodoAssignmentsService = async (todoId, trainerId) => {
    const todo = await Todo.findOne({
        where: { id: todoId, trainerId }
    });

    if (!todo) {
        throw new Error('Todo not found');
    }

    const assignments = await UserTodoAssignment.findAll({
        where: { todoId },
        include: [
            {
                model: user,
                as: 'user',
                attributes: ['id', 'username', 'email']
            },
            {
                model: ProgressSubmission,
                as: 'submissions',
                order: [['createdAt', 'DESC']]
            }
        ],
        order: [['assignedAt', 'DESC']]
    });

    return assignments;
};

// Mark assignment as complete with remarks
export const markAssignmentCompleteService = async (assignmentId, trainerId, remarks) => {
    const assignment = await UserTodoAssignment.findByPk(assignmentId, {
        include: [{
            model: Todo,
            as: 'todo',
            where: { trainerId }
        }]
    });

    if (!assignment) {
        throw new Error('Assignment not found');
    }

    assignment.status = 'completed';
    assignment.completedAt = new Date();
    assignment.trainerRemarks = remarks;
    await assignment.save();

    return assignment;
};

// Request revision
export const requestRevisionService = async (assignmentId, trainerId, remarks) => {
    const assignment = await UserTodoAssignment.findByPk(assignmentId, {
        include: [{
            model: Todo,
            as: 'todo',
            where: { trainerId }
        }]
    });

    if (!assignment) {
        throw new Error('Assignment not found');
    }

    assignment.status = 'revision_needed';
    assignment.trainerRemarks = remarks;
    await assignment.save();

    return assignment;
};

// ==================== USER SIDE ====================

// Get user's assigned todos
export const getUserAssignedTodosService = async (userId) => {
    const assignments = await UserTodoAssignment.findAll({
        where: { userId },
        include: [{
            model: Todo,
            as: 'todo',
            include: [
                { model: TodoResource, as: 'resources' },
                {
                    model: Trainer,
                    as: 'trainer',
                    include: [{
                        model: user,
                        attributes: ['id', 'username', 'email']
                    }]
                }
            ]
        }],
        order: [['assignedAt', 'DESC']]
    });

    return assignments;
};

// Get single assignment for user
export const getUserAssignmentService = async (assignmentId, userId) => {
    const assignment = await UserTodoAssignment.findOne({
        where: { id: assignmentId, userId },
        include: [
            {
                model: Todo,
                as: 'todo',
                include: [
                    { model: TodoResource, as: 'resources' },
                    {
                        model: Trainer,
                        as: 'trainer',
                        include: [{
                            model: user,
                            attributes: ['id', 'username', 'email']
                        }]
                    }
                ]
            },
            {
                model: ProgressSubmission,
                as: 'submissions',
                order: [['createdAt', 'DESC']]
            }
        ]
    });

    return assignment;
};

// Submit progress
export const submitProgressService = async (assignmentId, userId, submissionData) => {
    const assignment = await UserTodoAssignment.findOne({
        where: { id: assignmentId, userId }
    });

    if (!assignment) {
        throw new Error('Assignment not found');
    }

    const submission = await ProgressSubmission.create({
        assignmentId,
        userId,
        submissionType: submissionData.submissionType,
        content: submissionData.content,
        filePath: submissionData.filePath,
        fileName: submissionData.fileName,
        notes: submissionData.notes
    });

    // Update assignment status
    assignment.status = 'submitted';
    await assignment.save();

    return submission;
};

// Update assignment status (user marks as in progress)
export const updateAssignmentStatusService = async (assignmentId, userId, status) => {
    const assignment = await UserTodoAssignment.findOne({
        where: { id: assignmentId, userId }
    });

    if (!assignment) {
        throw new Error('Assignment not found');
    }

    assignment.status = status;
    await assignment.save();

    return assignment;
};

// ==================== TRAINER FEEDBACK ====================

// Give feedback on submission
export const giveFeedbackService = async (submissionId, trainerId, feedback) => {
    const submission = await ProgressSubmission.findByPk(submissionId, {
        include: [{
            model: UserTodoAssignment,
            as: 'assignment',
            include: [{
                model: Todo,
                as: 'todo',
                where: { trainerId }
            }]
        }]
    });

    if (!submission) {
        throw new Error('Submission not found');
    }

    submission.trainerFeedback = feedback;
    submission.feedbackAt = new Date();
    await submission.save();

    return submission;
};

// ==================== ADMIN FUNCTIONS ====================

// Get all client-todo assignments with filters and pagination
export const getAllAssignmentsAdminService = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        fromDate = null,
        toDate = null,
        trainerId = null,
        userId = null
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
        where.status = status;
    }

    if (fromDate && toDate) {
        where.assignedAt = {
            [Op.between]: [new Date(fromDate), new Date(toDate)]
        };
    } else if (fromDate) {
        where.assignedAt = { [Op.gte]: new Date(fromDate) };
    } else if (toDate) {
        where.assignedAt = { [Op.lte]: new Date(toDate) };
    }

    const todoWhere = {};
    if (trainerId) {
        todoWhere.trainerId = trainerId;
    }

    const userWhere = {};
    if (userId) {
        where.userId = userId;
    }

    if (search) {
        todoWhere[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } }
        ];
    }

    const { rows, count } = await UserTodoAssignment.findAndCountAll({
        where,
        include: [
            {
                model: Todo,
                as: 'todo',
                where: Object.keys(todoWhere).length > 0 ? todoWhere : undefined,
                include: [{
                    model: user,
                    as: 'trainer',
                    attributes: ['id', 'username', 'email']
                }]
            },
            {
                model: user,
                as: 'user',
                where: search && !Object.keys(todoWhere).length ? {
                    [Op.or]: [
                        { username: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                } : undefined,
                attributes: ['id', 'username', 'email']
            },
            {
                model: ProgressSubmission,
                as: 'submissions',
                limit: 1,
                order: [['createdAt', 'DESC']]
            }
        ],
        order: [['assignedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
    });

    return {
        assignments: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
    };
};

// Get statistics for admin dashboard
export const getAdminStatsService = async () => {
    const totalAssignments = await UserTodoAssignment.count();
    const pendingAssignments = await UserTodoAssignment.count({ where: { status: 'pending' } });
    const inProgressAssignments = await UserTodoAssignment.count({ where: { status: 'in_progress' } });
    const submittedAssignments = await UserTodoAssignment.count({ where: { status: 'submitted' } });
    const completedAssignments = await UserTodoAssignment.count({ where: { status: 'completed' } });
    const revisionNeededAssignments = await UserTodoAssignment.count({ where: { status: 'revision_needed' } });

    const totalEnrollments = await ClientEnrollment.count({ where: { status: 'accepted' } });
    const pendingEnrollments = await ClientEnrollment.count({ where: { status: 'pending' } });

    return {
        assignments: {
            total: totalAssignments,
            pending: pendingAssignments,
            inProgress: inProgressAssignments,
            submitted: submittedAssignments,
            completed: completedAssignments,
            revisionNeeded: revisionNeededAssignments
        },
        enrollments: {
            total: totalEnrollments,
            pending: pendingEnrollments
        }
    };
};

// Get user dashboard stats
export const getUserDashboardStatsService = async (userId) => {
    const totalAssignments = await UserTodoAssignment.count({ where: { userId } });
    const pendingAssignments = await UserTodoAssignment.count({ where: { userId, status: 'pending' } });
    const inProgressAssignments = await UserTodoAssignment.count({ where: { userId, status: 'in_progress' } });
    const submittedAssignments = await UserTodoAssignment.count({ where: { userId, status: 'submitted' } });
    const completedAssignments = await UserTodoAssignment.count({ where: { userId, status: 'completed' } });
    const revisionNeededAssignments = await UserTodoAssignment.count({ where: { userId, status: 'revision_needed' } });

    const enrollments = await ClientEnrollment.count({ where: { userId, status: 'accepted' } });

    return {
        assignments: {
            total: totalAssignments,
            pending: pendingAssignments,
            inProgress: inProgressAssignments,
            submitted: submittedAssignments,
            completed: completedAssignments,
            revisionNeeded: revisionNeededAssignments
        },
        trainers: enrollments
    };
};

// Get trainer dashboard stats
export const getTrainerDashboardStatsService = async (trainerId) => {
    const totalClients = await ClientEnrollment.count({ where: { trainerId, status: 'accepted' } });
    const pendingRequests = await ClientEnrollment.count({ where: { trainerId, status: 'pending' } });
    const totalTodos = await Todo.count({ where: { trainerId } });
    
    const todoIds = await Todo.findAll({
        where: { trainerId },
        attributes: ['id']
    });
    const ids = todoIds.map(t => t.id);

    let assignmentStats = {
        total: 0,
        pending: 0,
        submitted: 0,
        completed: 0
    };

    if (ids.length > 0) {
        assignmentStats.total = await UserTodoAssignment.count({ where: { todoId: { [Op.in]: ids } } });
        assignmentStats.pending = await UserTodoAssignment.count({ where: { todoId: { [Op.in]: ids }, status: 'pending' } });
        assignmentStats.submitted = await UserTodoAssignment.count({ where: { todoId: { [Op.in]: ids }, status: 'submitted' } });
        assignmentStats.completed = await UserTodoAssignment.count({ where: { todoId: { [Op.in]: ids }, status: 'completed' } });
    }

    return {
        clients: {
            total: totalClients,
            pendingRequests
        },
        todos: totalTodos,
        assignments: assignmentStats
    };
};
