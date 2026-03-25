import React from 'react'
import { FaCheckCircle } from "react-icons/fa";


const EsewaSuccess = () => {
  return (
    <div className='border h-screen w-full flex flex-col items-center justify-center'>
        <div className='rounded-[50%] p-2 text- bg-[#D4F4E5]'>
            
        <FaCheckCircle className='text-6xl rounded-xl text-[#07C68C] ' />

        </div>

        <div className='border'>
            <h1>Payment successful. Thank you! YOur payment was successfully proceed.</h1>
        </div>

        
    </div>
  )
}

export default EsewaSuccess