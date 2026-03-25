

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const TrainerDocument = sequelize.define(
  "TrainerDocument",
  {
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentURL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);

export default TrainerDocument;