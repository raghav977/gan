

import Datauri from 'datauri';

import path from 'path';


const parser = new Datauri();


const dataUri = (originalName,buffer)=>{
     try{
        const ext = path.extname(originalName);

        const result = parser.format(ext, buffer);

        return result.content;

        

     }  
     catch(err){
        console.error("something went wrong",err);
        return null;

     }

}

export default dataUri;