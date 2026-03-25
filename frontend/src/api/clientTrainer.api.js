import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

// Get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
};

// ==================== ENROLLMENT APIs ====================

// User requests enrollment
export const requestEnrollment = async (trainerId, requestMessage = "") => {
    const response = await axios.post(
        `${API_URL}/api/client-trainer/enrollment/request`,
        { trainerId, requestMessage },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Get user's enrollments
export const getUserEnrollments = async () => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/enrollment/my-enrollments`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Check enrollment status with a trainer
export const checkEnrollmentStatus = async (trainerId) => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/enrollment/status/${trainerId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// ==================== TRAINER ENROLLMENT APIs ====================

// Get enrollment requests
export const getEnrollmentRequests = async (status = "") => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/trainer/enrollment-requests`,
        { 
            headers: getAuthHeader(),
            params: { status }
        }
    );
    return response.data;
};

// Accept enrollment
export const acceptEnrollment = async (enrollmentId) => {
    const response = await axios.put(
        `${API_URL}/api/client-trainer/trainer/enrollment/${enrollmentId}/accept`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Reject enrollment
export const rejectEnrollment = async (enrollmentId, rejectionReason = "") => {
    const response = await axios.put(
        `${API_URL}/api/client-trainer/trainer/enrollment/${enrollmentId}/reject`,
        { rejectionReason },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Get trainer's clients
export const getTrainerClients = async () => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/trainer/clients`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// ==================== TRAINER TODO APIs ====================

// Create todo with resources
export const createTodo = async (formData) => {
    const response = await axios.post(
        `${API_URL}/api/client-trainer/trainer/todos`,
        formData,
        { 
            headers: { 
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

// Get trainer's todos
export const getTrainerTodos = async () => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/trainer/todos`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Get single todo
export const getTodoById = async (todoId) => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/trainer/todos/${todoId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Update todo
export const updateTodo = async (todoId, data) => {
    const response = await axios.put(
        `${API_URL}/api/client-trainer/trainer/todos/${todoId}`,
        data,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Delete todo
export const deleteTodo = async (todoId) => {
    const response = await axios.delete(
        `${API_URL}/api/client-trainer/trainer/todos/${todoId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Add resource to todo
export const addTodoResource = async (todoId, formData) => {
    const response = await axios.post(
        `${API_URL}/api/client-trainer/trainer/todos/${todoId}/resources`,
        formData,
        { 
            headers: { 
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

// Delete resource
export const deleteTodoResource = async (resourceId) => {
    const response = await axios.delete(
        `${API_URL}/api/client-trainer/trainer/resources/${resourceId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// ==================== TRAINER ASSIGNMENT APIs ====================

// Assign todo to users
export const assignTodoToUsers = async (todoId, userIds) => {
    const response = await axios.post(
        `${API_URL}/api/client-trainer/trainer/todos/${todoId}/assign`,
        { userIds },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Get todo assignments
export const getTodoAssignments = async (todoId) => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/trainer/todos/${todoId}/assignments`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Mark assignment complete
export const markAssignmentComplete = async (assignmentId, remarks = "") => {
    const response = await axios.put(
        `${API_URL}/api/client-trainer/trainer/assignments/${assignmentId}/complete`,
        { remarks },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Request revision
export const requestRevision = async (assignmentId, remarks) => {
    const response = await axios.put(
        `${API_URL}/api/client-trainer/trainer/assignments/${assignmentId}/revision`,
        { remarks },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Give feedback
export const giveFeedback = async (submissionId, feedback) => {
    const response = await axios.put(
        `${API_URL}/api/client-trainer/trainer/submissions/${submissionId}/feedback`,
        { feedback },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Trainer dashboard stats
export const getTrainerDashboardStats = async () => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/trainer/dashboard/stats`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// ==================== USER TODO APIs ====================

// Get user's assigned todos
export const getUserAssignedTodos = async () => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/user/todos`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Get single assignment
export const getUserAssignment = async (assignmentId) => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/user/todos/${assignmentId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// Submit progress
export const submitProgress = async (assignmentId, formData) => {
    const response = await axios.post(
        `${API_URL}/api/client-trainer/user/todos/${assignmentId}/submit`,
        formData,
        { 
            headers: { 
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

// Update assignment status
export const updateAssignmentStatus = async (assignmentId, status) => {
    const response = await axios.put(
        `${API_URL}/api/client-trainer/user/todos/${assignmentId}/status`,
        { status },
        { headers: getAuthHeader() }
    );
    return response.data;
};

// User dashboard stats
export const getUserDashboardStats = async () => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/user/dashboard/stats`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

// ==================== ADMIN APIs ====================

// Get all assignments with filters
export const getAllAssignmentsAdmin = async (params = {}) => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/admin/assignments`,
        { 
            headers: getAuthHeader(),
            params
        }
    );
    return response.data;
};

// Get admin stats
export const getAdminStats = async () => {
    const response = await axios.get(
        `${API_URL}/api/client-trainer/admin/stats`,
        { headers: getAuthHeader() }
    );
    return response.data;
};
