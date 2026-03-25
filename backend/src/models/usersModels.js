import {sequelize} from "../config/db.js";
import { DataTypes } from "sequelize";


const user = sequelize.define(
    "User",{
        username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active:{
    type: DataTypes.BOOLEAN,
    defaultValue:true
  },
  role: {
    allowNull: false,
    type: DataTypes.ENUM(['user', 'trainer', 'admin']),
    defaultValue: 'user'
  }
    }

)

export default user;