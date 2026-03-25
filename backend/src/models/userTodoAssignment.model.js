import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

// User Todo Assignment - Links todos to users with individual status tracking
const UserTodoAssignment = sequelize.define("UserTodoAssignment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    todoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Todos',
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
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'submitted', 'completed', 'revision_needed'),
        defaultValue: 'pending'
    },
    assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    trainerRemarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

export default UserTodoAssignment;
