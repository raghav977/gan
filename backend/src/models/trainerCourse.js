import { sequelize } from "../config/db.js";

import { DataTypes } from "sequelize";

export const TrainerCourse = sequelize.define(
  "TrainerCourse",
  {
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    courseImage:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    status:{
        type: DataTypes.ENUM(['draft', 'published', 'archived']),
        defaultValue: 'draft'
    }
  }
);


