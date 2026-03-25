import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { CourseWeek } from "../models/trainer.weeks.js";
import { TrainerCourse } from "../models/trainerCourse.js";
import { fieldValidation } from "../utils/validation.js"
import { CourseMaterial } from "../models/trainer.lecture.js";


export const createCourseService = async(trainerId,title,description,duration,price,status,file)=>{
    if(!fieldValidation(title,description,duration,price,status)){
        throw new Error("Please Input all the fields");
    }
    console.log("this is file");
    if(!file) throw new Error("Please add a thumbnail");
    console.log("this is file",file);



    const newCourse = await TrainerCourse.create({
        courseName:title,
        description,
        duration,
        courseImage:file.path,
        price,
        status,
        trainerId
    })
    return newCourse;

}

// export const create


export const createWeekSection = async(course_id,title,description,position=1,is_published=false,lecture_title=null,upload_vide_url=null,upload_resoure_file=null,lecture_status,)=>{

    const transaction = await sequelize.transaction();
    try{
        

        const weeek = await CourseWeek.create({
            courseId:course_id,
            title,
            description,
            position,
            published:is_published

        },
    {
        transaction
    })


    await transaction.commit();
    }
    catch(err){

        await transaction.rollback();

    }
}


export const uploadLectureVideoController = async (file,trainerId,lectureId) => {

    const lecture = await CourseMaterial.findByPk(lectureId);
    if(!lecture) {
        throw new Error("Lecture not found for this ID");
    }

    const week = await CourseWeek.findByPk(lecture.weekId);
    if(!week){
        throw new Error("Week not found");
    }
    console.log("this is week",week.courseId)
    console.log("This is trainer id",trainerId)

    // owner wala
    const course = await TrainerCourse.findOne({
        where:{
            id:week.courseId,
            trainerId
        }
    })

    if(!course){
        throw new Error("This course doesn't belong to you")
    }

    console.log("This is file",file);
  if (!file) throw new Error("No video file provided");

  lecture.videoUrl = file.path;
  await lecture.save();


  // just return the video info
  return {
    message: "Video uploaded successfully",
    videoUrl: file.path
  };
};


// same mathi ko jastai but of resource

export const uploadLectureResourceMaterialService = async(file,trainerId,lectureId)=>{
    try{
          if(!file){
            throw new Error("No resource file provided");
        }
        const lecture = await CourseMaterial.findByPk(lectureId);
        if(!lecture){
            throw new Error("Lecture not found");
        }
        const week = await CourseWeek.findByPk(lecture.weekId);
        if(!week){
            throw new Error("Week not found");
        }

        console.log("This is week id for resource controller",week.courseId)
        console.log("This is trainer id for resource controller",trainerId)
        // owner wala
        const course = await TrainerCourse.findOne({
            where:{
                id:week.courseId,
                trainerId
            }
        });
        if(!course){
            throw new Error("You are not authorized for this course");
        }
      
        lecture.resourceUrl = file.path;
        await lecture.save();
        return {
            message:"Resource uploaded successfully",
            resourceUrl:file.path
        }
    }
    catch(err){
        console.log("Something went wrong",err.message);
        throw err;
    }
}


// Update course status service
export const updateCourseStatusService = async (courseId, trainerId, status) => {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const course = await TrainerCourse.findOne({
        where: {
            id: courseId,
            trainerId: trainerId
        }
    });

    if (!course) {
        throw new Error("Course not found or you are not authorized");
    }

    course.status = status;
    await course.save();

    return course;
};

// courses belonging to the trainer/owner
export const getCoursesListServices = async(trainerId,page=1,limit=10,search,status)=>{

    
    const offset = (page-1) * limit;

    const whereClause = {
        trainerId
    }
    console.log("I am here");

    if(search){
        whereClause.courseName = {
            [Op.like]: `%${search}%`
        };
    }
    console.log("THis is where clause",whereClause)
    if(status){
        whereClause.status = status;
    }

    const {count,rows} = await TrainerCourse.findAndCountAll({
        where:whereClause,
        limit:parseInt(limit),
        offset:parseInt(offset),
    })
    console.log("This is rows",rows);

    return {
        total:count,
        totalPages:Math.ceil(count/limit),
        currentPage:parseInt(page),
        result:rows

    }

    
    
}


export const createWeekService = async(courseId,trainerId,title,description)=>{
    courseId = parseInt(courseId);
    const transaction = await sequelize.transaction();
    try{
        const course = await TrainerCourse.findOne({
            where:{
                id:courseId,
                trainerId:trainerId
            },
            transaction
        })

        if(!course){
            throw new Error("You are not authorized for this course");
        }

        const lastWeek = await CourseWeek.findOne({
            where:{
                courseId
            },
            order:[
                ['position','DESC']
            ],
            transaction

        })

        const newPosition = lastWeek? lastWeek.position+1:1;

        const newCourseWeek = await CourseWeek.create({
            title,
            description,
            position:newPosition,
            courseId,
        },
    {
        transaction
    })

    await transaction.commit();

        return newCourseWeek;

        

    }
    catch(err){
        console.log("Something went wrong",err.message);
        await transaction.rollback();
        throw err;

    }
}

export const createLectureService = async (
  weekId,
  trainerId,
  title,
  videoUrl = null,
  resourceUrl = null
) => {
  const transaction = await sequelize.transaction();

  try {

    const courseWeek = await CourseWeek.findByPk(weekId, { transaction });
    console.log("here")
    if (!courseWeek) {
      throw new Error("Week not found");
    }

    console.log("This is course week course id",courseWeek.courseId)
    console.log("This is trainerId",trainerId);


    const course = await TrainerCourse.findOne({
      where: {
        id: courseWeek.courseId,
        trainerId: trainerId,
      },
      transaction,
    });

    if (!course) {
      throw new Error("You are not authorized to add lectures to this course");
    }


    const lastLecture = await CourseMaterial.findOne({
      where: { weekId },
      order: [["position", "DESC"]],
      transaction,
    });

    const newPosition = lastLecture ? lastLecture.position + 1 : 1;


    const lecture = await CourseMaterial.create(
      {
        title,
        videoUrl,
        resourceUrl,
        position: newPosition,
        weekId: weekId,
      },
      { transaction }
    );

    await transaction.commit();
    return lecture;

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Get single course with weeks and lectures
export const getCourseDetailService = async (courseId, trainerId) => {
  const course = await TrainerCourse.findOne({
    where: {
      id: courseId,
      trainerId: trainerId,
    },
    include: [
      {
        model: CourseWeek,
        as: 'weeks',
        include: [
          {
            model: CourseMaterial,
            as: 'materials',
          },
        ],
      },
    ],
    order: [
      [{ model: CourseWeek, as: 'weeks' }, "position", "ASC"],
      [{ model: CourseWeek, as: 'weeks' }, { model: CourseMaterial, as: 'materials' }, "position", "ASC"],
    ],
  });

  if (!course) {
    throw new Error("Course not found or you are not authorized");
  }

  return course;
};

// Update week service
export const updateWeekService = async (weekId, trainerId, updates) => {
  const transaction = await sequelize.transaction();
  try {
    const week = await CourseWeek.findByPk(weekId, { transaction });
    if (!week) {
      throw new Error("Week not found");
    }

    const course = await TrainerCourse.findOne({
      where: {
        id: week.courseId,
        trainerId: trainerId,
      },
      transaction,
    });

    if (!course) {
      throw new Error("You are not authorized to update this week");
    }

    await week.update(updates, { transaction });
    await transaction.commit();
    return week;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Delete week service
export const deleteWeekService = async (weekId, trainerId) => {
  const transaction = await sequelize.transaction();
  try {
    const week = await CourseWeek.findByPk(weekId, { transaction });
    if (!week) {
      throw new Error("Week not found");
    }

    const course = await TrainerCourse.findOne({
      where: {
        id: week.courseId,
        trainerId: trainerId,
      },
      transaction,
    });

    if (!course) {
      throw new Error("You are not authorized to delete this week");
    }

    // Delete all lectures in this week first
    await CourseMaterial.destroy({
      where: { weekId: weekId },
      transaction,
    });

    await week.destroy({ transaction });
    await transaction.commit();
    return { message: "Week deleted successfully" };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Update lecture service
export const updateLectureService = async (lectureId, trainerId, updates) => {
  const transaction = await sequelize.transaction();
  try {
    const lecture = await CourseMaterial.findByPk(lectureId, { transaction });
    if (!lecture) {
      throw new Error("Lecture not found");
    }

    const week = await CourseWeek.findByPk(lecture.weekId, { transaction });
    if (!week) {
      throw new Error("Week not found");
    }

    const course = await TrainerCourse.findOne({
      where: {
        id: week.courseId,
        trainerId: trainerId,
      },
      transaction,
    });

    if (!course) {
      throw new Error("You are not authorized to update this lecture");
    }

    await lecture.update(updates, { transaction });
    await transaction.commit();
    return lecture;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Delete lecture service
export const deleteLectureService = async (lectureId, trainerId) => {
  const transaction = await sequelize.transaction();
  try {
    const lecture = await CourseMaterial.findByPk(lectureId, { transaction });
    if (!lecture) {
      throw new Error("Lecture not found");
    }

    const week = await CourseWeek.findByPk(lecture.weekId, { transaction });
    if (!week) {
      throw new Error("Week not found");
    }

    const course = await TrainerCourse.findOne({
      where: {
        id: week.courseId,
        trainerId: trainerId,
      },
      transaction,
    });

    if (!course) {
      throw new Error("You are not authorized to delete this lecture");
    }

    await lecture.destroy({ transaction });
    await transaction.commit();
    return { message: "Lecture deleted successfully" };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Reorder weeks service
export const reorderWeeksService = async (courseId, trainerId, weekOrders) => {
  const transaction = await sequelize.transaction();
  try {
    const course = await TrainerCourse.findOne({
      where: {
        id: courseId,
        trainerId: trainerId,
      },
      transaction,
    });

    if (!course) {
      throw new Error("You are not authorized to reorder weeks in this course");
    }

    // weekOrders is an array of { id, position }
    for (const item of weekOrders) {
      await CourseWeek.update(
        { position: item.position },
        { where: { id: item.id, courseId: courseId }, transaction }
      );
    }

    await transaction.commit();
    return { message: "Weeks reordered successfully" };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

// Reorder lectures service
export const reorderLecturesService = async (weekId, trainerId, lectureOrders) => {
  const transaction = await sequelize.transaction();
  try {
    const week = await CourseWeek.findByPk(weekId, { transaction });
    if (!week) {
      throw new Error("Week not found");
    }

    const course = await TrainerCourse.findOne({
      where: {
        id: week.courseId,
        trainerId: trainerId,
      },
      transaction,
    });

    if (!course) {
      throw new Error("You are not authorized to reorder lectures in this week");
    }

    // lectureOrders is an array of { id, position }
    for (const item of lectureOrders) {
      await CourseMaterial.update(
        { position: item.position },
        { where: { id: item.id, weekId: weekId }, transaction }
      );
    }

    await transaction.commit();
    return { message: "Lectures reordered successfully" };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};