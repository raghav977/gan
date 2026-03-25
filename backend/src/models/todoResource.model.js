import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

// Todo Resources - PDF, video, docs attached to a todo
const TodoResource = sequelize.define("TodoResource", {
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
    resourceType: {
        type: DataTypes.ENUM('pdf', 'video', 'image', 'document', 'other'),
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

export default TodoResource;
