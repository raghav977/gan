// import { TrainerCourse } from "../models/trainerCourse.js";
// import { CourseWeek } from "../models/trainer.weeks.js";
// import { CourseMaterial } from "../models/trainer.lecture.js";

// import user from "../models/usersModels.js";

// import Trainer from "../models/TrainerModels.js";
// import { sequelize } from "../config/db";

// // Client-Trainer Management Models
// import ClientEnrollment from "../models/clientEnrollment.model.js";
// import Todo from "../models/todo.model.js";
// import TodoResource from "../models/todoResource.model.js";
// import UserTodoAssignment from "../models/userTodoAssignment.model.js";
// import ProgressSubmission from "../models/progressSubmission.model.js";

// Trainer.hasMany(TrainerCourse, { foreignKey: "trainerId"});
// TrainerCourse.belongsTo(Trainer, { foreignKey: "trainerId", as: "trainer" });

// TrainerCourse.hasMany(CourseWeek, { foreignKey: "courseId", as: "weeks" });
// CourseWeek.belongsTo(TrainerCourse, { foreignKey: "courseId", as: "course" });

// CourseWeek.hasMany(CourseMaterial, { foreignKey: "weekId", as: "materials" });
// CourseMaterial.belongsTo(CourseWeek, { foreignKey: "weekId", as: "week" });

// user.hasOne(Trainer, { foreignKey: "userId", as: "trainerProfile" });
// Trainer.belongsTo(user, { foreignKey: "userId", as: "user" });

// // Client Enrollment Relations
// user.hasMany(ClientEnrollment, { foreignKey: "userId", as: "enrollmentsAsClient" });
// ClientEnrollment.belongsTo(user, { foreignKey: "userId", as: "client" });

// user.hasMany(ClientEnrollment, { foreignKey: "trainerId", as: "enrollmentsAsTrainer" });
// ClientEnrollment.belongsTo(user, { foreignKey: "trainerId", as: "trainer" });

// // Todo Relations
// user.hasMany(Todo, { foreignKey: "trainerId", as: "createdTodos" });
// Todo.belongsTo(user, { foreignKey: "trainerId", as: "trainer" });

// Todo.hasMany(TodoResource, { foreignKey: "todoId", as: "resources" });
// TodoResource.belongsTo(Todo, { foreignKey: "todoId", as: "todo" });

// // User Todo Assignment Relations
// Todo.hasMany(UserTodoAssignment, { foreignKey: "todoId", as: "assignments" });
// UserTodoAssignment.belongsTo(Todo, { foreignKey: "todoId", as: "todo" });

// user.hasMany(UserTodoAssignment, { foreignKey: "userId", as: "todoAssignments" });
// UserTodoAssignment.belongsTo(user, { foreignKey: "userId", as: "user" });

// // Progress Submission Relations
// UserTodoAssignment.hasMany(ProgressSubmission, { foreignKey: "assignmentId", as: "submissions" });
// ProgressSubmission.belongsTo(UserTodoAssignment, { foreignKey: "assignmentId", as: "assignment" });

// user.hasMany(ProgressSubmission, { foreignKey: "userId", as: "progressSubmissions" });
// ProgressSubmission.belongsTo(user, { foreignKey: "userId", as: "user" });


// const syncDatabase = async()=>{
//     try{
//         const authenticate = await sequelize.authenticate();
//         console.log("Database connected successfully");

//         await sequelize.sync({alter:true});
//         console.log("database synced");

//     }
//     catch(err){
//         console.error("Error connecting to the database:", err);
//     }
// }

// syncDatabase();