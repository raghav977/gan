import { getApprovedTrainerListService } from "../services/public.trainerlist.js";

export const getApprovedTrainerListController = async(req,res)=>{
    try{
        console.log("This is req.query",req.query);
        const {search,limit,page} = req.query;
        console.log("This is limit",limit)
        
        const resultofApprovedTrainer = await getApprovedTrainerListService(limit,page,search);
        return res.status(200).json(resultofApprovedTrainer)
        

    }
    catch(err){
        console.log("something went wrong on ",err)
        return res.status(500).json({
            message:"Something went wrong",
            detail:err.message
        })

    }
}