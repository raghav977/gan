import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id"
        }
    },
    actorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Users",
            key: "id"
        }
    },
    type: {
        type: DataTypes.ENUM("MESSAGE", "TODO", "PRODUCT", "GENERAL"),
        defaultValue: "GENERAL"
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

export default Notification;
