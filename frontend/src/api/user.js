
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const loginUser = async (email,password)=>{
    try{
        const response = await fetch(`${BACKEND_URL}/api/login`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email,password})
        });

        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to login");
        }

        

        return await response.json();
    }
    catch(err){
        console.log("Something went wrong during login",err.message);
        throw err;

    }
}