import { TrainerCourse } from "../models/trainerCourse.js"
import { 
    createCourseService, 
    createLectureService, 
    createWeekService,
    getCoursesListServices, 
    getCourseDetailService,
    updateCourseStatusService,
    updateWeekService,
    deleteWeekService,
    updateLectureService,
    deleteLectureService,
    reorderWeeksService,
    reorderLecturesService,
    uploadLectureResourceMaterialService, 
    uploadLectureVideoController 
} from "../services/course.service.js";
import { getTrainerIdFromUser } from "../services/user.services.js";
import { fieldValidation } from "../utils/validation.js";

export const createCourse = async(req,res)=>{
    console.log(req.files);
    const {title,description,duration,price,status="draft"} = req.body;
    const file= req.file;

    const user = req.user;
    const trainer = await getTrainerIdFromUser(user);

   
    // if(!fieldValidation(title,description,duration,price)){
    //     return res.json()
    // }
    // role based authentication baki xa
    try{
        console.log("is this here??")
        const newCourse = await createCourseService(trainer,title,description,duration,price,status,file)
        return res.status(200).json({
            "message":"Course Created succesfully"
        })

    }
    catch(err){
        console.log("thiss is error",err);
        return res.status(500).json({
            "eror":err.message
        })

    }
}

export const uploadVideoController = async(req,res)=>{
    try{

        const file = req.file;
        if(!file){
            return res.status(400).json({
                message:"Video file is missing"
            })
        }
        const trainer = await getTrainerIdFromUser(req.user);
        const {lectureId} = req.params;

        const result = await uploadLectureVideoController(file,trainer,lectureId);
        console.log("This is result",result)

        res.status(200).json(result);

    }
    catch(err){
        console.error("Something went wrong",err.message);
        res.status(500).json({
            message:err.message
        })

    }
}


// mathi ko jasto upload resource controller wala

export const uploadResourceController = async(req,res)=>{
    try{
        const trainerId = await getTrainerIdFromUser(req.user);
        const {lectureId} = req.params;

        const result = await uploadLectureResourceMaterialService(req.file,trainerId,lectureId);

        res.status(200).json({
            message:"Resource uploaded successfully",
            resourceUrl: result.resourceUrl
        })


    }
    catch(err){
        return res.status(500).json({
            message:err.message
        })
    }
}

// courses belonging to the trainer or owner

export const getCoursesController = async(req,res)=>{

    try{


        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const search = req.query.search || "";

        const status = req.query.status || "";

        const user = req.user;
        const trainerId = await getTrainerIdFromUser(user);

        const coursesList = await getCoursesListServices(trainerId,page,limit,search,status)

        return res.status(200).json(coursesList)

    }
    catch(err){
        console.log("This is error message",err.message);
        return res.status(500).json({
            message:err.message
        })

    }
}

// Update course status controller
export const updateCourseStatusController = async(req, res) => {
    try {
        const { courseId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const trainerId = await getTrainerIdFromUser(req.user);
        const course = await updateCourseStatusService(parseInt(courseId), trainerId, status);

        return res.status(200).json({
            message: "Course status updated successfully",
            course
        });
    } catch(err) {
        console.error("Update course status error:", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}


export const createLectureController = async(req,res)=>{

    
    try{
        const {weekId} = req.params;
        const {title} = req.body;

        console.log("Create lecture - weekId:", weekId, "title:", title);

        if(!weekId || weekId === 'undefined') {
            return res.status(400).json({ message: "Week ID is required" });
        }

        if(!title){
            return res.status(400).json({ message: "Lecture title is required" });
        }

        const trainerId = await getTrainerIdFromUser(req.user);

        // if(!trainerId){

        // }
        const lecture = await createLectureService(parseInt(weekId),trainerId,title);
         return res.status(201).json({
            message: "Lecture created successfully",lecture,
        });


    }
    catch(err){
        console.error("Something went wrong",err.message);
        return res.status(500).json({
            message:err.message
        })

    }
}

// Get single course with weeks and lectures
export const getCourseDetailController = async(req, res) => {
    try {
        const { courseId } = req.params;
        const trainerId = await getTrainerIdFromUser(req.user);
        
        const course = await getCourseDetailService(parseInt(courseId), trainerId);
        
        return res.status(200).json(course);
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}

// Create week controller
export const createWeekController = async(req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description } = req.body;
        
        if(!title) {
            return res.status(400).json({ message: "Week title is required" });
        }
        
        const trainerId = await getTrainerIdFromUser(req.user);
        const week = await createWeekService(parseInt(courseId), trainerId, title, description);
        
        return res.status(201).json({
            message: "Week created successfully",
            week
        });
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}

// Update week controller
export const updateWeekController = async(req, res) => {
    try {
        const { weekId } = req.params;
        const { title, description, published } = req.body;
        
        const trainerId = await getTrainerIdFromUser(req.user);
        const updates = {};
        if(title !== undefined) updates.title = title;
        if(description !== undefined) updates.description = description;
        if(published !== undefined) updates.published = published;
        
        const week = await updateWeekService(parseInt(weekId), trainerId, updates);
        
        return res.status(200).json({
            message: "Week updated successfully",
            week
        });
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}

// Delete week controller
export const deleteWeekController = async(req, res) => {
    try {
        const { weekId } = req.params;
        const trainerId = await getTrainerIdFromUser(req.user);
        
        const result = await deleteWeekService(parseInt(weekId), trainerId);
        
        return res.status(200).json(result);
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}

// Update lecture controller
export const updateLectureController = async(req, res) => {
    try {
        const { lectureId } = req.params;
        const { title, published } = req.body;
        
        const trainerId = await getTrainerIdFromUser(req.user);
        const updates = {};
        if(title !== undefined) updates.title = title;
        if(published !== undefined) updates.published = published;
        
        const lecture = await updateLectureService(parseInt(lectureId), trainerId, updates);
        
        return res.status(200).json({
            message: "Lecture updated successfully",
            lecture
        });
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}

// Delete lecture controller
export const deleteLectureController = async(req, res) => {
    try {
        const { lectureId } = req.params;
        const trainerId = await getTrainerIdFromUser(req.user);
        
        const result = await deleteLectureService(parseInt(lectureId), trainerId);
        
        return res.status(200).json(result);
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}

// Reorder weeks controller
export const reorderWeeksController = async(req, res) => {
    try {
        const { courseId } = req.params;
        const { weekOrders } = req.body; // Array of { id, position }
        
        if(!weekOrders || !Array.isArray(weekOrders)) {
            return res.status(400).json({ message: "weekOrders array is required" });
        }
        
        const trainerId = await getTrainerIdFromUser(req.user);
        const result = await reorderWeeksService(parseInt(courseId), trainerId, weekOrders);
        
        return res.status(200).json(result);
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}

// Reorder lectures controller
export const reorderLecturesController = async(req, res) => {
    try {
        const { weekId } = req.params;
        const { lectureOrders } = req.body; // Array of { id, position }
        
        if(!lectureOrders || !Array.isArray(lectureOrders)) {
            return res.status(400).json({ message: "lectureOrders array is required" });
        }
        
        const trainerId = await getTrainerIdFromUser(req.user);
        const result = await reorderLecturesService(parseInt(weekId), trainerId, lectureOrders);
        
        return res.status(200).json(result);
    } catch(err) {
        console.error("Something went wrong", err.message);
        return res.status(500).json({
            message: err.message
        });
    }
}