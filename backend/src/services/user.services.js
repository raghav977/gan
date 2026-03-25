import { fieldValidation } from "../utils/validation.js";
import bcrypt from 'bcrypt';
import Trainer from "../models/TrainerModels.js";
import TrainerDocument from "../models/trainerdocument.model.js";
import user from "../models/usersModels.js";
import { sequelize } from "../config/db.js";





export const registerUserService = async (email, password, username, contact,role="user") => {

    if (!fieldValidation(email, password, username, contact)) {
        throw new Error("Please input all the required fields");
    }


    const existingUser = await user.findOne({ where: { email } });
    if (existingUser) {
        throw new Error("User already exists");
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = await user.create({ email, password: hashedPassword, username, contact,role});

    return newUser;
};





export const registerTrainerServie = async (
    email, password, username, contact,
    specialization, type, latitude, longitude, radius,
    files
) => {
    console.log("the email is",email);
    console.log("the pwd is",password)
    console.log("username",username)
    console.log("contect",contact)
    console.log("specialization",specialization)
    console.log("type",type)
    console.log("lat",latitude)
    console.log("long",longitude)
    console.log("radius",radius)


    if (!fieldValidation(email, password, username, contact, specialization, type, latitude, longitude, radius)) {
        throw new Error("Please input all the required fields");
    }

    const role = "trainer";

    const transaction = await sequelize.transaction();

    try {

        const newUser = await registerUserService(email, password, username, contact,role);


        const newTrainer = await Trainer.create({
            specialization,
            type,
            latitude,
            longitude,
            radius,
            userId: newUser.id
        }, { transaction });

        if (files && files.length > 0) {
            const documents = files.map(f => ({
                trainerId: newTrainer.id,
                documentType: f.mimetype,
                documentURL: f.path
            }));
            await TrainerDocument.bulkCreate(documents, { transaction });
        }


        await transaction.commit();

        return {
            success: true,
            status: 201,
            message: "Trainer registered successfully",
            data: { newUser, newTrainer }
        };

    } catch (err) {

        await transaction.rollback();
        throw err;
    }
};



export const getTrainerIdFromUser = async(user)=>{
    try{
        const userId = user.id;
        const trainer = await Trainer.findOne({
            where:{
                userId
            }
        })

        if(!trainer){
            throw new Error("Trainer not found for")
        }
        return trainer.id;
    }
    catch(err){
        throw err;
        

    }
}

