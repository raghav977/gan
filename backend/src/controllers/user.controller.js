import { registerUserService } from "../services/user.services.js";
import http from "../http/response.js";
import { sequelize } from "../config/db.js";
import user from "../models/usersModels.js";


import bcrypt from "bcrypt";
import { generateToken } from "../utils/validation.js";




// Register user api
export const registerUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { email, password, contact, username } = req.body;
   
    const result = await registerUserService(
        email,
        password,
        username, 
        contact);

    

    await transaction.commit();
    return http.created(res, result.message, result.data);

  } catch (error) {
    await transaction.rollback();
    return http.serverError(res, "Somthing went wrong", error.message);
  }
};


export const loginUser = async(req,res)=>{
  try{
    const {email,password} = req.body;

    const userExist = await user.findOne({
      where:{
        email
      }
    })

    if(!userExist){
      return res.status(404).json({
        message:"The user for this email doesn't exist"
      })
    }

    const hashedPassword = userExist.password;

    const isPasswordMatch = await bcrypt.compare(password,hashedPassword);

    if(!isPasswordMatch){
      return res.status(404).json({
        message:"Password doesn't match"
      })
    }


    const token = generateToken({
      id: userExist.id,
      role: userExist.role,
    });


    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: userExist.id,
        email: userExist.email,
        username: userExist.username,
        role: userExist.role,
      },
    });
    
    

  }
  catch(err){
    console.log(err.message)
    res.status(400).json({
      message:"Something went wrong"
    })

  }
}




