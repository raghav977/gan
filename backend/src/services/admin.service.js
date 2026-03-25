import { loginUser } from "../controllers/user.controller";
import user from "../models/usersModels"
import { generateToken } from "../utils/validation";
import { registerUserService } from "./user.services";

import bcrypt from "bcrypt";
export const adminSignUpService = async(email,password)=>{
    try{
        const checkEmail = await user.findOne(email);
        if(checkEmail){
            throw new Error("User with this Email already exist")
        }

        const createUser = await registerUserService(email,password,"admin","98073811","admin");

        return createUser;

    }
    catch(err){
        console.log("Something went wrong");
        throw err;
    }
}


