import axios from "axios"

import { jwtDecode } from "jwt-decode"

const trainerApi = axios.create({
    baseURL:"http://localhost:5001/api/trainer"
});

trainerApi.interceptors.request.use(config=>{
    const token = localStorage.getItem("token");
    if(token){
        try{
            const decoded = jwtDecode(token);
            if(decoded.exp*1000<Date.now()){
                localStorage.removeItem("token");
                window.location.href = "/login";

                return Promise.reject("Tokene expired");

            }
            config.headers.Authorization=`Bearer ${token}`
            console.log("Okay got it")

        }
        catch(err){
            localStorage.removeItem("token");
            window.location.href="/login";
            return Promise.reject("Invalid token")

        }
    }
    return config;
},
(error)=>{
    Promise.reject(error);
}
)

trainerApi.interceptors.response.use(response=>response,(error)=>{
    if(error.response && error.response.status==401){
        localStorage.removeItem("token");
        window.location.href="/login";
    }
    return Promise.reject(error);
})

export default trainerApi;