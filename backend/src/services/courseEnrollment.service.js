import CourseEnrollment from "../models/courseEnrollment.model.js";
import { TrainerCourse } from "../models/trainerCourse.js";
import { CourseWeek } from "../models/trainer.weeks.js";
import { CourseMaterial } from "../models/trainer.lecture.js";
import Trainer from "../models/TrainerModels.js";
import user from "../models/usersModels.js";
import { Op } from "sequelize";
import crypto from "crypto";

// ==================== COURSE ENROLLMENT ====================

// Enroll user in a course (instant enrollment)
export const enrollInCourseService = async (userId, courseId) => {
    // Check if course exists and is published
    const course = await TrainerCourse.findOne({
        where: {
            id: courseId,
            status: 'published'
        }
    });
     
    if (!course) {
        throw new Error("Course not found or not available for enrollment");
    }
    console.log("This is course",course);
    const amount = Number(course.price);
    const tax_amount = amount * 0.13;
    const total_amount = amount + tax_amount;

    const transaction_uuid = Date.now().toString();

    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=EPAYTEST`;

    const secret = "8gBm/:&EnhH.1/q";

    const signature = crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("base64");

   

    // return data;


     

    // Check if already enrolled
    const existing = await CourseEnrollment.findOne({
        where: {
            userId,
            courseId,
            status: { [Op.in]: ['active', 'completed'] }
        }
    });

    if (existing) {
        throw new Error("You are already enrolled in this course");
    }

    // Get first lecture for current lecture
    const firstWeek = await CourseWeek.findOne({
        where: { courseId },
        order: [['position', 'ASC']],
        include: [{
            model: CourseMaterial,
            as: 'materials',
            order: [['position', 'ASC']],
            limit: 1
        }]
    });

    const firstLectureId = firstWeek?.materials?.[0]?.id || null;

   

    // const enrollment = await CourseEnrollment.create({
    //     userId,
    //     courseId,
    //     status: 'active',
    //     progress: 0,
    //     currentLectureId: firstLectureId,
    //     completedLectures: [],
    //     enrolledAt: new Date()
    // });
     const data = {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code: "EPAYTEST",
        signature,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        success_url: "http://localhost:5173/course/payment/success",
        failure_url: "http://localhost:5173/course/payment/failure"
    };
    return data;
};

// Check enrollment status
export const checkCourseEnrollmentService = async (userId, courseId) => {
    const enrollment = await CourseEnrollment.findOne({
        where: {
            userId,
            courseId
        }
    });

    return enrollment;
};

// Get user's enrolled courses
export const getUserCoursesService = async (userId, status = null) => {
    const where = { userId };
    if (status) {
        where.status = status;
    }

    const enrollments = await CourseEnrollment.findAll({
        where,
        include: [{
            model: TrainerCourse,
            as: 'course',
            attributes: ['id', 'courseName', 'description', 'duration', 'price', 'courseImage', 'status'],
            include: [{
                model: Trainer,
                attributes: ['id'],
                include: [{
                    model: user,
                    attributes: ['username']
                }]
            }, {
                model: CourseWeek,
                as: 'weeks',
                attributes: ['id', 'title', 'position'],
                include: [{
                    model: CourseMaterial,
                    as: 'materials',
                    attributes: ['id', 'title', 'position']
                }]
            }]
        }],
        order: [['enrolledAt', 'DESC']]
    });

    return enrollments.map(enrollment => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        status: enrollment.status,
        progress: enrollment.progress,
        currentLectureId: enrollment.currentLectureId,
        completedLectures: enrollment.completedLectures || [],
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        course: enrollment.course ? {
            id: enrollment.course.id,
            courseName: enrollment.course.courseName,
            description: enrollment.course.description,
            duration: enrollment.course.duration,
            price: enrollment.course.price,
            courseImage: enrollment.course.courseImage,
            trainerName: enrollment.course.Trainer?.User?.username || "Unknown",
            totalLectures: enrollment.course.weeks?.reduce((sum, week) => 
                sum + (week.materials?.length || 0), 0) || 0
        } : null
    }));
};

// Get enrolled course detail with full content (videos, resources)
export const getEnrolledCourseDetailService = async (userId, courseId) => {
    // Check if enrolled
    const enrollment = await CourseEnrollment.findOne({
        where: {
            userId,
            courseId,
            status: { [Op.in]: ['active', 'completed'] }
        }
    });

    if (!enrollment) {
        throw new Error("You are not enrolled in this course");
    }

    // Get full course with all content
    const course = await TrainerCourse.findOne({
        where: { id: courseId },
        attributes: ['id', 'courseName', 'description', 'duration', 'price', 'courseImage', 'status', 'createdAt'],
        include: [
            {
                model: Trainer,
                attributes: ['id'],
                include: [{
                    model: user,
                    attributes: ['username', 'email']
                }]
            },
            {
                model: CourseWeek,
                as: 'weeks',
                attributes: ['id', 'title', 'description', 'position'],
                include: [{
                    model: CourseMaterial,
                    as: 'materials',
                    attributes: ['id', 'title', 'videoUrl', 'resourceUrl', 'position']
                }]
            }
        ],
        order: [
            [{ model: CourseWeek, as: 'weeks' }, 'position', 'ASC'],
            [{ model: CourseWeek, as: 'weeks' }, { model: CourseMaterial, as: 'materials' }, 'position', 'ASC']
        ]
    });

    if (!course) {
        throw new Error("Course not found");
    }

    // Format response
    return {
        enrollment: {
            id: enrollment.id,
            status: enrollment.status,
            progress: enrollment.progress,
            currentLectureId: enrollment.currentLectureId,
            completedLectures: enrollment.completedLectures || [],
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt
        },
        course: {
            id: course.id,
            courseName: course.courseName,
            description: course.description,
            duration: course.duration,
            price: course.price,
            courseImage: course.courseImage,
            trainerName: course.Trainer?.User?.username || "Unknown",
            trainerEmail: course.Trainer?.User?.email || "",
            weeks: (course.weeks || []).map(week => ({
                id: week.id,
                title: week.title,
                description: week.description,
                position: week.position,
                lectures: (week.materials || []).map(lecture => ({
                    id: lecture.id,
                    title: lecture.title,
                    videoUrl: lecture.videoUrl,
                    resourceUrl: lecture.resourceUrl,
                    position: lecture.position,
                    isCompleted: (enrollment.completedLectures || []).includes(lecture.id)
                }))
            })),
            totalLectures: course.weeks?.reduce((sum, week) => 
                sum + (week.materials?.length || 0), 0) || 0
        }
    };
};

// Update lecture progress (mark complete, update current)
export const updateLectureProgressService = async (userId, courseId, lectureId, isCompleted = true) => {
    const enrollment = await CourseEnrollment.findOne({
        where: {
            userId,
            courseId,
            status: 'active'
        }
    });

    if (!enrollment) {
        throw new Error("You are not enrolled in this course");
    }

    // Get lecture to verify it belongs to this course
    const lecture = await CourseMaterial.findOne({
        where: { id: lectureId },
        include: [{
            model: CourseWeek,
            as: 'week',
            where: { courseId }
        }]
    });

    if (!lecture) {
        throw new Error("Lecture not found in this course");
    }

    let completedLectures = enrollment.completedLectures || [];
    
    if (isCompleted && !completedLectures.includes(lectureId)) {
        completedLectures.push(lectureId);
    } else if (!isCompleted && completedLectures.includes(lectureId)) {
        completedLectures = completedLectures.filter(id => id !== lectureId);
    }

    // Calculate progress
    const course = await TrainerCourse.findByPk(courseId, {
        include: [{
            model: CourseWeek,
            as: 'weeks',
            include: [{
                model: CourseMaterial,
                as: 'materials',
                attributes: ['id']
            }]
        }]
    });

    const totalLectures = course.weeks?.reduce((sum, week) => 
        sum + (week.materials?.length || 0), 0) || 1;
    
    const progress = Math.round((completedLectures.length / totalLectures) * 100);

    // Check if course completed
    const isComplete = progress >= 100;

    await enrollment.update({
        currentLectureId: lectureId,
        completedLectures,
        progress,
        status: isComplete ? 'completed' : 'active',
        completedAt: isComplete ? new Date() : null
    });

    return enrollment;
};

// Get specific lecture content
export const getLectureContentService = async (userId, courseId, lectureId) => {
    // Check if enrolled
    const enrollment = await CourseEnrollment.findOne({
        where: {
            userId,
            courseId,
            status: { [Op.in]: ['active', 'completed'] }
        }
    });

    if (!enrollment) {
        throw new Error("You are not enrolled in this course");
    }

    // Get lecture with course verification
    const lecture = await CourseMaterial.findOne({
        where: { id: lectureId },
        include: [{
            model: CourseWeek,
            as: 'week',
            where: { courseId },
            attributes: ['id', 'title', 'courseId']
        }]
    });

    if (!lecture) {
        throw new Error("Lecture not found in this course");
    }

    // Update current lecture
    await enrollment.update({ currentLectureId: lectureId });

    return {
        id: lecture.id,
        title: lecture.title,
        videoUrl: lecture.videoUrl,
        resourceUrl: lecture.resourceUrl,
        position: lecture.position,
        weekId: lecture.week.id,
        weekTitle: lecture.week.title,
        isCompleted: (enrollment.completedLectures || []).includes(lectureId)
    };
};
