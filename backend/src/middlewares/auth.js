import { TrainerCourse } from "../models/trainerCourse.js";
import AppError from "../utils/error.js";
import { verifyToken } from "../utils/validation.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new AppError("Unauthorized request", 401, "UNAUTHORIZED")
      );
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = verifyToken(token);

    req.user = decoded;
    req.role = decoded.role;
    

    next(); 
  } catch (err) {
    next(
      new AppError("Invalid or expired token", 401, "INVALID_TOKEN")
    );
  }
};

export const trainerAuthMiddleware = (req, res, next) => {

  if (req.role !== "trainer") {
    return next(
      new AppError("Access denied: Trainers only", 403, "FORBIDDEN")
    );
  }
  next();
}


export const isCourseOwner = async(req,res,next)=>{
  try{
    const {courseId} = req.params;
    const course = await TrainerCourse.findOne({
      where:{
        id:courseId
      }
    })

    if(!course){
      return next(new AppError("Course not found",404,"NOT FOUND"));

    }
    if(course.trainerId!=req.user.id){
      return next (new AppError("Not authroized to access this course",403,"FORBIDDEN"))
    }
    req.course = course;
    next();

  }
  catch(err){
    next(err);

  }
}



export const adminAuthMiddleware = async(req,res,next)=>{
  if (req.role !== "admin") {
    return next(
      new AppError("Access denied: Trainers only", 403, "FORBIDDEN")
    );
  }
  next();
}

