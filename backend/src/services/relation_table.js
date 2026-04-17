 import {sequelize} from "../config/db.js";
import user from "../models/usersModels.js";

import Trainer from "../models/TrainerModels.js";
import TrainerDocument from "../models/trainerdocument.model.js";

import { TrainerCourse } from "../models/trainerCourse.js";
import { CourseWeek } from "../models/trainer.weeks.js";
import { CourseMaterial } from "../models/trainer.lecture.js";

import { Product } from "../models/admin.product.js";

import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// Import Client-Trainer models
import ClientEnrollment from "../models/clientEnrollment.model.js";
import Todo from "../models/todo.model.js";
import TodoResource from "../models/todoResource.model.js";
import UserTodoAssignment from "../models/userTodoAssignment.model.js";
import ProgressSubmission from "../models/progressSubmission.model.js";

// Import Course Enrollment model
import CourseEnrollment from "../models/courseEnrollment.model.js";
import CoursePayment from "../models/coursePayment.js";
import { UserProduct } from "../models/user.product.js";
import { UserProductPayment } from "../models/userproduct.payment.model.js";
import Notification from "../models/notification.model.js";

// Define associations
user.hasOne(Trainer, { foreignKey: 'userId', onDelete: 'CASCADE' });
Trainer.belongsTo(user, { foreignKey: 'userId' });

Trainer.hasMany(TrainerDocument, { foreignKey: 'trainerId', onDelete: 'CASCADE' });
TrainerDocument.belongsTo(Trainer, { foreignKey: 'trainerId' });

Trainer.hasMany(TrainerCourse, { foreignKey: 'trainerId', onDelete: 'CASCADE' });
TrainerCourse.belongsTo(Trainer, { foreignKey: 'trainerId' });

TrainerCourse.hasMany(CourseWeek, { foreignKey: 'courseId', as: 'weeks', onDelete: 'CASCADE' });
CourseWeek.belongsTo(TrainerCourse, { foreignKey: 'courseId', as: 'course' });

CourseWeek.hasMany(CourseMaterial, { foreignKey: 'weekId', as: 'materials', onDelete: 'CASCADE' });
CourseMaterial.belongsTo(CourseWeek, { foreignKey: 'weekId', as: 'week' });

// Conversation and Message associations
user.hasMany(Conversation, { foreignKey: 'participantOneId', as: 'conversationsAsOne' });
user.hasMany(Conversation, { foreignKey: 'participantTwoId', as: 'conversationsAsTwo' });
Conversation.belongsTo(user, { foreignKey: 'participantOneId', as: 'participantOne' });
Conversation.belongsTo(user, { foreignKey: 'participantTwoId', as: 'participantTwo' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

user.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
user.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(user, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(user, { foreignKey: 'receiverId', as: 'receiver' });

// ==================== CLIENT-TRAINER ASSOCIATIONS ====================

// User <-> ClientEnrollment (User enrolls with Trainer)
user.hasMany(ClientEnrollment, { foreignKey: 'userId', as: 'enrollments' });
ClientEnrollment.belongsTo(user, { foreignKey: 'userId', as: 'user' });

// Trainer <-> ClientEnrollment (Trainer has enrolled clients)
Trainer.hasMany(ClientEnrollment, { foreignKey: 'trainerId', as: 'clientEnrollments' });
ClientEnrollment.belongsTo(Trainer, { foreignKey: 'trainerId', as: 'trainer' });

// Trainer <-> Todo (Trainer creates todos)
// Note: trainerId is actually a userId (user with role='trainer')
user.hasMany(Todo, { foreignKey: 'trainerId', as: 'createdTodos' });
Todo.belongsTo(user, { foreignKey: 'trainerId', as: 'trainer' });

// Todo <-> TodoResource (Todo has resources)
Todo.hasMany(TodoResource, { foreignKey: 'todoId', as: 'resources', onDelete: 'CASCADE' });
TodoResource.belongsTo(Todo, { foreignKey: 'todoId', as: 'todo' });

// Todo <-> UserTodoAssignment (Todo assigned to users)
Todo.hasMany(UserTodoAssignment, { foreignKey: 'todoId', as: 'assignments', onDelete: 'CASCADE' });
UserTodoAssignment.belongsTo(Todo, { foreignKey: 'todoId', as: 'todo' });

// User <-> UserTodoAssignment (User has assigned todos)
user.hasMany(UserTodoAssignment, { foreignKey: 'userId', as: 'todoAssignments' });
UserTodoAssignment.belongsTo(user, { foreignKey: 'userId', as: 'user' });

// UserTodoAssignment <-> ProgressSubmission (Assignment has submissions)
UserTodoAssignment.hasMany(ProgressSubmission, { foreignKey: 'assignmentId', as: 'submissions', onDelete: 'CASCADE' });
ProgressSubmission.belongsTo(UserTodoAssignment, { foreignKey: 'assignmentId', as: 'assignment' });

// User <-> ProgressSubmission (User submits progress)
user.hasMany(ProgressSubmission, { foreignKey: 'userId', as: 'progressSubmissions' });
ProgressSubmission.belongsTo(user, { foreignKey: 'userId', as: 'user' });

// ==================== COURSE ENROLLMENT ASSOCIATIONS ====================

// User <-> CourseEnrollment (User enrolls in courses)
user.hasMany(CourseEnrollment, { foreignKey: 'userId', as: 'courseEnrollments' });
CourseEnrollment.belongsTo(user, { foreignKey: 'userId', as: 'user' });




// TrainerCourse <-> CourseEnrollment (Course has enrolled users)
TrainerCourse.hasMany(CourseEnrollment, { foreignKey: 'courseId', as: 'enrollments' });
CourseEnrollment.belongsTo(TrainerCourse, { foreignKey: 'courseId', as: 'course' });


// courses and payment, user and payment
user.hasMany(CoursePayment,{
    foreignKey:'userId',
    onDelete:"CASCADE"
})

CoursePayment.belongsTo(user, {
  foreignKey: 'userId'
});

TrainerCourse.hasMany(CoursePayment, {
  foreignKey: 'courseId'
});

CoursePayment.belongsTo(TrainerCourse, {
  foreignKey: 'courseId'
});




// CourseMaterial <-> CourseEnrollment (Current lecture reference)
CourseMaterial.hasMany(CourseEnrollment, { foreignKey: 'currentLectureId', as: 'currentEnrollments' });
CourseEnrollment.belongsTo(CourseMaterial, { foreignKey: 'currentLectureId', as: 'currentLecture' });


// product and user association
user.hasMany(UserProduct,{
    foreignKey:'userId',
    onDelete:"CASCADE",
    as:'purchases'
})

UserProduct.belongsTo(user,{
    foreignKey:'userId',
    as:'buyer'
})

Product.hasMany(UserProduct,{
    foreignKey:'productId',
    as: 'userProducts'
})

UserProduct.belongsTo(Product,{
    foreignKey:'productId',
    as: 'product'
})



// User <-> UserProductPayment (User makes payments for products)

user.hasMany(UserProductPayment,{
    foreignKey:'userId',
    onDelete:"CASCADE"
})
// Sync database
UserProductPayment.belongsTo(user,{
    foreignKey:'userId'
})

Product.hasMany(UserProductPayment,{
    foreignKey:'productId',
    as: 'productPayments'
})

UserProductPayment.belongsTo(Product,{
    foreignKey:'productId',
    as: 'product'
})

UserProduct.hasMany(UserProductPayment, {
    foreignKey: 'userProductId',
    as: 'payments'
});

UserProductPayment.belongsTo(UserProduct, {
    foreignKey: 'userProductId',
    as: 'cartItem'
});

// Notifications
user.hasMany(Notification, {
    foreignKey: 'userId',
    as: 'notifications',
    onDelete: 'CASCADE'
});

Notification.belongsTo(user, {
    foreignKey: 'userId',
    as: 'recipient'
});

Notification.belongsTo(user, {
    foreignKey: 'actorId',
    as: 'actor'
});

const syncDatabase = async()=>{
    try{
        await sequelize.authenticate();
        
        const seque = await sequelize.sync({
            alter: false  // Set to false to avoid constraint errors
        })
        console.log("database synced    ");
    }
    catch(err){
        console.log("something went wrong",err);
    }
}

export default syncDatabase;