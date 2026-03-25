import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

// Course Enrollment - When a user enrolls in a course
const CourseEnrollment = sequelize.define("CourseEnrollment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrainerCourses',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active'
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0  // Percentage 0-100
    },
    currentLectureId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'CourseMaterials',
            key: 'id'
        }
    },
    completedLectures: {
        type: DataTypes.JSON,
        defaultValue: []  // Array of lecture IDs that user has completed
    },
    enrolledAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

export default CourseEnrollment;
