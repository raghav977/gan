import { TrainerCourse } from "../models/trainerCourse.js";
import Trainer from "../models/TrainerModels.js";
import user from "../models/usersModels.js";
import { Op } from "sequelize";

export const getAdminCoursesService = async ({
    page = 1,
    limit = 10,
    search = "",
    status = ""
} = {}) => {
    const parsedLimit = Math.max(parseInt(limit) || 10, 1);
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereClause = {};
    if (status) {
        whereClause.status = status;
    }

    if (search) {
        whereClause[Op.or] = [
            { courseName: { [Op.like]: `%${search}%` } },
            { "$Trainer.User.username$": { [Op.like]: `%${search}%` } }
        ];
    }

    const { rows, count } = await TrainerCourse.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Trainer,
                attributes: ["id"],
                include: [
                    {
                        model: user,
                        attributes: ["id", "username", "email"]
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]],
        limit: parsedLimit,
        offset,
        distinct: true,
        subQuery: false
    });

    const courses = rows.map((course) => ({
        id: course.id,
        courseName: course.courseName,
        description: course.description,
        duration: course.duration,
        price: course.price,
        status: course.status,
        courseImage: course.courseImage,
        createdAt: course.createdAt,
        trainer: course.Trainer
            ? {
                  id: course.Trainer.id,
                  username: course.Trainer.User?.username || "Unknown",
                  email: course.Trainer.User?.email || "N/A"
              }
            : null
    }));

    return {
        courses,
        total: count,
        totalPages: Math.max(Math.ceil(count / parsedLimit), 1),
        currentPage: parsedPage,
        perPage: parsedLimit
    };
};
