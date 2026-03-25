import { col, Model } from "sequelize";
import Trainer from "../models/TrainerModels.js";
import user from "../models/usersModels.js";

export const getApprovedTrainerListService = async(limit=10,page=1,search="")=>{
    try{
        limit = parseInt(limit)
        page = parseInt(page)
        const offset = (page-1) * limit;
        
        let whereClause = {}
        whereClause.is_verified = true;

        if(search){
            whereClause.username = search
        }
        console.log("This is search",search)
       const {count,rows:approvedTrainer} = await Trainer.findAndCountAll({
         attributes: [
    'id',
    'specialization',
    'type',
    'latitude',
    'longitude',
    'radius',
    'is_verified',
    'userId',
    [col('User.username'), 'username'],
    [col('User.email'), 'email']
  ],
    where: whereClause,
    include: {
        model: user,
        attributes: []
    },
    limit: limit,
    offset: offset
})
        console.log("This is approved trainer",approvedTrainer);
        
        return {
            approvedTrainer,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };


    }
    catch(err){
        console.log("Something went wrong",err);
        throw err;

    }
}
