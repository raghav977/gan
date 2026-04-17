import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const UserProductPayment = sequelize.define("UserProductPayment", {
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
        allowNull: true,
        references: {
            model: 'Products',
            key: 'id'
        }
    },
    status:{
        type:DataTypes.ENUM('PENDING','COMPLETED','FAILED'),
        defaultValue:"PENDING"
    },
    userProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'UserProducts',
            key: 'id'
        }
    },
    transaction_uuid:{
        type:DataTypes.STRING,
        allowNull:false,
    },
     amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
}, {
    timestamps: true
});