import multer from "multer"
import fs from "fs"
import path from "path"


const videoDir = "uploads/videos";

if(!fs.existsSync(videoDir)){
    fs.mkdirSync(videoDir,{recursive:true})
}

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,videoDir);
    },
    filename: (req,file,cb)=>{
        const uniqueName = Date.now() + "- " + file.originalname.replace(/\s/g, "_");
        cb(null,uniqueName);
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith("video/")){
        cb(null,true);
    }
    else{
        cb(new Error("Only videos files are allowed"),false);
    }
}

export const uploadVideo = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, 
})