import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';


const Trainer = sequelize.define(
    "Trainer", {
    specialization: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
    },
    longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
    },
    radius: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_verified:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }
}
)

export default Trainer;