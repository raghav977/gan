import CoursePayment from "../models/coursePayment.js";
import axios from "axios"
import {
    enrollInCourseService,
    checkCourseEnrollmentService,
    getUserCoursesService,
    getEnrolledCourseDetailService,
    updateLectureProgressService,
    getLectureContentService
} from "../services/courseEnrollment.service.js";
import CourseEnrollment from "../models/courseEnrollment.model.js";

// Enroll in a course
export const enrollInCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const enrollment = await enrollInCourseService(userId, parseInt(courseId));

        console.log("This is enrollment",enrollment)
        return res.status(201).json({
            message: "Successfully enrolled in the course!",
            data: enrollment
        });
    } catch (err) {
        console.error("Enroll error:", err.message);
        return res.status(400).json({
            message: err.message
        });
    }
};

// Check enrollment status
export const checkEnrollment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const enrollment = await checkCourseEnrollmentService(userId, parseInt(courseId));

        return res.status(200).json({
            data: enrollment ? {
                enrolled: true,
                status: enrollment.status,
                progress: enrollment.progress,
                enrolledAt: enrollment.enrolledAt
            } : {
                enrolled: false
            }
        });
    } catch (err) {
        console.error("Check enrollment error:", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
};

// Get user's enrolled courses (My Courses)
export const getMyCoursesController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const courses = await getUserCoursesService(userId, status);

        return res.status(200).json({
            data: courses
        });
    } catch (err) {
        console.error("Get my courses error:", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
};

// Get enrolled course detail (for course player)
export const getEnrolledCourseDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const data = await getEnrolledCourseDetailService(userId, parseInt(courseId));

        return res.status(200).json({
            data
        });
    } catch (err) {
        console.error("Get enrolled course error:", err.message);
        return res.status(400).json({
            message: err.message
        });
    }
};

// Update lecture progress
export const updateProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, lectureId } = req.params;
        const { isCompleted = true } = req.body;

        const enrollment = await updateLectureProgressService(
            userId, 
            parseInt(courseId), 
            parseInt(lectureId), 
            isCompleted
        );

        return res.status(200).json({
            message: "Progress updated",
            data: {
                progress: enrollment.progress,
                completedLectures: enrollment.completedLectures,
                status: enrollment.status
            }
        });
    } catch (err) {
        console.error("Update progress error:", err.message);
        return res.status(400).json({
            message: err.message
        });
    }
};

// Get lecture content
export const getLectureContent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, lectureId } = req.params;

        const lecture = await getLectureContentService(
            userId, 
            parseInt(courseId), 
            parseInt(lectureId)
        );

        return res.status(200).json({
            data: lecture
        });
    } catch (err) {
        console.error("Get lecture error:", err.message);
        return res.status(400).json({
            message: err.message
        });
    }
};



// course enrollment verification

export const verifyCoursePayment = async(req,res)=>{
    try{
        console.log("This si reqbody",req.body);
        const {transaction_uuid} = req.body;
        console.log("THis is data",transaction_uuid);



        const productCode = transaction_uuid.product_code;
        const totalAmount = parseFloat(transaction_uuid.total_amount);
        const transaction_id = parseInt(transaction_uuid.transaction_uuid);
        const payment = await CoursePayment.findOne({ where: { transaction_uuid: transaction_uuid.transaction_uuid } });
        console.log("This is payment",payment);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        const response = await axios.get(`https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${productCode}&total_amount=${totalAmount}&transaction_uuid=${transaction_id}`)

        console.log("This is response",response);
        payment.status='COMPLETED';
        const courseEnrollment = await CourseEnrollment.findOne({
            where: { courseId: payment.courseId, userId: req.user.id }
        });
        console.log("This is course enrollment",courseEnrollment);
        console.log("THis is payment course id",payment.courseId);
         console.log("This is payment user id",req.user.id);

        if(courseEnrollment){
            courseEnrollment.status = 'active';
            await courseEnrollment.save();
        }
        await payment.save();
        return res.status(200).json({
            message: "Payment verified and course enrollment updated",
            data: {
                paymentStatus: payment.status,
                enrollmentStatus: courseEnrollment ? courseEnrollment.status : 'not enrolled'
            }
        });

    }
    catch(err){
        console.error("Payment verification error:", err.message);
        return res.status(400).json({
            message: err.message
        });
    }
}