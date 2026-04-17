import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const OTP = sequelize.define("OTP", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        index: true
    },
    otpCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    attemptCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    registrationType: {
        type: DataTypes.ENUM('user', 'trainer'),
        allowNull: false
    },
    tempData: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Store temporary registration data'
    }
}, {
    timestamps: true
});

export default OTP;
