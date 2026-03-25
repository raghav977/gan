import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

export const CourseMaterial = sequelize.define("CourseMaterial", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING,
  },
  resourceUrl: {
    type: DataTypes.STRING,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
