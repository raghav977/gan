import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

// Progress Submission - User's progress submission (video/photo)
const ProgressSubmission = sequelize.define("ProgressSubmission", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    assignmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'UserTodoAssignments',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    submissionType: {
        type: DataTypes.ENUM('video', 'image', 'text'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true // For text submissions
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: true // For video/image submissions
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    trainerFeedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    feedbackAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

export default ProgressSubmission;
