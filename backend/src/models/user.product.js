import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const UserProduct = sequelize.define("UserProduct", {
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
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status:{
        type:DataTypes.ENUM('PENDING','PURCHASED','CANCELLED'),
        defaultValue:"PENDING"
    }
}, {
    timestamps: true
});