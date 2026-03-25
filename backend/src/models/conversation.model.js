import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const Conversation = sequelize.define("Conversation", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    participantOneId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    participantTwoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

export default Conversation;
