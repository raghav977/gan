import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

// Course Enrollment - When a user enrolls in a course
const CoursePayment = sequelize.define("CoursePayment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'TrainerCourses',
            key: 'id'
        }
    },
    status:{
        type:DataTypes.ENUM('PENDING','COMPLETED','FAILED'),
        defaultValue:"PENDING"
    },
    transaction_uuid:{
        type:DataTypes.STRING,
        allowNull:false,
    },
     userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
     amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
}, {
    timestamps: true
});

export default CoursePayment;
