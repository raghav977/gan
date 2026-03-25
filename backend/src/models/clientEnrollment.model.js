import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

// Client Enrollment - When a user wants to become an online student of a trainer
const ClientEnrollment = sequelize.define("ClientEnrollment", {
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
    trainerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
    },
    requestMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

export default ClientEnrollment;
