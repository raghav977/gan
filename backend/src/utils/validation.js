import dotenv from "dotenv";

dotenv.config();

import jwt from "jsonwebtoken"
export const fieldValidation = (...data) => {
    for (let value of data) {
        if (!value) {
            return false;
        }
    }
    return true;
};


export const verifyToken = (token)=>{
    try{
        console.log("this is jwt secret",process.env.SECRET_KEY)
        const decoded = jwt.verify(token,process.env.SECRET_KEY);
        return decoded;

    }
    catch(err){
        return null;
    }
}

export const generateToken = (payload)=>{
    console.log("This is JWT secret",process.env.SECRET_KEY)
    const token = jwt.sign(payload,process.env.SECRET_KEY,{
        expiresIn:"7d"
    });
    return token;
}
