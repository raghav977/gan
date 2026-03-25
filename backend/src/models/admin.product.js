import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Product = sequelize.define("product",{
    productName:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    productDescription:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    productPrice:{
        type:DataTypes.FLOAT,
        allowNull:false,
    },
    productStock:{
        type:DataTypes.INTEGER,
    },
    productImage:{
        type:DataTypes.STRING,
        allowNull:false,
    }
})
