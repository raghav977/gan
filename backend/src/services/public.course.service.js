import { TrainerCourse } from "../models/trainerCourse.js"
import Trainer from "../models/TrainerModels.js"
import user from "../models/usersModels.js"
import { CourseWeek } from "../models/trainer.weeks.js"
import { CourseMaterial } from "../models/trainer.lecture.js"
import { Op } from "sequelize"

export const getPublicCoursesServices = async(limit = 10, page = 1, search = "") => {
    try {
        const offset = (page - 1) * limit;
        
        // Build where clause for search
        const whereClause = {
            status: 'published' // Only show published courses
        };
        
        // Build include with search conditions
        const includeClause = [
            {
                model: Trainer,
                attributes: ['id'],
                include: [
                    {
                        model: user,
                        attributes: ['username'],
                        // Search by username if search term provided
                        ...(search && {
                            where: {
                                username: {
                                    [Op.like]: `%${search}%`
                                }
                            },
                            required: false
                        })
                    }
                ]
            }
        ];
        
        // If search term provided, search in course name OR trainer username
        if (search) {
            whereClause[Op.or] = [
                {
                    courseName: {
                        [Op.like]: `%${search}%`
                    }
                }
            ];
        }
        
        // Get courses with search in course name
        const { count, rows: courses } = await TrainerCourse.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: ['id', 'courseName', 'description', 'duration', 'price', 'courseImage', 'status'],
            include: [
                {
                    model: Trainer,
                    attributes: ['id'],
                    include: [
                        {
                            model: user,
                            attributes: ['username']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // If searching by username, also get courses where trainer username matches
        let usernameMatchCourses = [];
        if (search) {
            const usernameMatches = await TrainerCourse.findAll({
                where: {
                    status: 'published'
                },
                attributes: ['id', 'courseName', 'description', 'duration', 'price', 'courseImage', 'status'],
                include: [
                    {
                        model: Trainer,
                        attributes: ['id'],
                        required: true,
                        include: [
                            {
                                model: user,
                                attributes: ['username'],
                                where: {
                                    username: {
                                        [Op.like]: `%${search}%`
                                    }
                                },
                                required: true
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            usernameMatchCourses = usernameMatches;
        }

        // Merge and deduplicate results
        const allCourses = [...courses];
        usernameMatchCourses.forEach(course => {
            if (!allCourses.find(c => c.id === course.id)) {
                allCourses.push(course);
            }
        });

        // Apply pagination to merged results if searching
        const paginatedCourses = search 
            ? allCourses.slice(0, parseInt(limit))
            : allCourses;

        if (!paginatedCourses || paginatedCourses.length === 0) {
            return {
                courses: [],
                total: 0,
                totalPages: 0,
                currentPage: parseInt(page)
            };
        }

        // Format response for frontend
        const formattedCourses = paginatedCourses.map((c) => ({
            id: c.id,
            courseName: c.courseName,
            description: c.description,
            duration: c.duration,
            price: c.price,
            courseImage: c.courseImage,
            status: c.status,
            trainerId: c.Trainer ? c.Trainer.id : null,
            trainerName: c.Trainer?.User ? c.Trainer.User.username : "Unknown"
        }));

        const totalCount = search ? allCourses.length : count;

        return {
            courses: formattedCourses,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page)
        };

    } catch (err) {
        console.error("Something went wrong", err.message);
        throw err;
    }
}



export const getPublicCourseDetailService = async(courseId) => {
    try {
        const course = await TrainerCourse.findOne({
            where: {
                id: courseId,
                status: 'published' // Only allow viewing published courses
            },
            attributes: ['id', 'courseName', 'description', 'duration', 'price', 'courseImage', 'status', 'createdAt'],
            include: [
                {
                    model: Trainer,
                    attributes: ['id'],
                    include: [
                        {
                            model: user,
                            attributes: ['username']
                        }
                    ]
                },
                {
                    model: CourseWeek,
                    as: 'weeks',
                    attributes: ['id', 'title', 'description', 'position', 'published'],
                    include: [
                        {
                            model: CourseMaterial,
                            as: 'materials',
                            // Only show title and position - NOT videoUrl or resourceUrl
                            attributes: ['id', 'title', 'position', 'published'],
                        }
                    ]
                }
            ],
            order: [
                [{ model: CourseWeek, as: 'weeks' }, 'position', 'ASC'],
                [{ model: CourseWeek, as: 'weeks' }, { model: CourseMaterial, as: 'materials' }, 'position', 'ASC']
            ]
        });

        if (!course) {
            throw new Error("Course not found or not available");
        }

        // Format the response for frontend
        const formattedCourse = {
            id: course.id,
            courseName: course.courseName,
            description: course.description,
            duration: course.duration,
            price: course.price,
            courseImage: course.courseImage,
            status: course.status,
            createdAt: course.createdAt,
            trainerId: course.Trainer ? course.Trainer.id : null,
            trainerName: course.Trainer?.User ? course.Trainer.User.username : "Unknown",
            // Format weeks/syllabus
            syllabus: (course.weeks || []).map(week => ({
                id: week.id,
                title: week.title,
                description: week.description,
                position: week.position,
                lectureCount: week.materials ? week.materials.length : 0,
                // Only show lecture titles, not content
                lectures: (week.materials || []).map(lecture => ({
                    id: lecture.id,
                    title: lecture.title,
                    position: lecture.position,
                    // Indicate if content exists without exposing URLs
                    hasVideo: false, // We don't expose this info publicly
                    hasResource: false
                }))
            })),
            // Summary stats
            totalWeeks: course.weeks ? course.weeks.length : 0,
            totalLectures: course.weeks 
                ? course.weeks.reduce((sum, week) => sum + (week.materials ? week.materials.length : 0), 0)
                : 0
        };

        return formattedCourse;

    } catch (err) {
        console.error("Something went wrong", err.message);
        throw err;
    }
}