import { useEffect,useState } from "react";

export function useGeoLocation(){
    const [location,setLocation] = useState(null);
    const [errors,setErrors] = useState(null)

    useEffect(()=>{
        if(!navigator.geolocation){
            setErrors("Geolocation is not supported by this browser.")
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos)=>setLocation({
                lat:pos.coords.latitude,
                lng:pos.coords.longitude
            }),
            ()=>setErrors("Location permission is denied"),
            {
                enableHighAccuracy:true
            }
        )
    },[])

    return {location,errors}
}