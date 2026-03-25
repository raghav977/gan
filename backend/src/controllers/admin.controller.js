import { validateFields } from "../../../frontend/src/utils/validation.js";
import { registerUserService } from "../services/user.services.js";

export const adminSignUp =async(req,res)=>{
    try{
        const {email,password} = req.body;

        const isValidate = validateFields(email,password)
        if (!isValidate){
            return res.status(404).json({
                message:"Please input all the fields"
            })
        }

        const admiCreate = await registerUserService(email,password,"admin","981234567","admin");
        return admiCreate;
    }
    catch(err){
        console.error("The error",err.message)
        throw err;

    }
}