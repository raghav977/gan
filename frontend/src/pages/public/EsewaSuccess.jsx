import React, { useMemo } from 'react';
import { useEffect } from 'react';
import { FaCheckCircle } from "react-icons/fa";
import { useSearchParams, Link } from 'react-router-dom';
import { verifyCoursePayment } from '../../api/courseEnrollment';

const EsewaSuccess = () => {
  const [searchParams] = useSearchParams();
  const data = searchParams.get('data');

  console.log("THis is dt",data)

  const payment = useMemo(() => {
    if (!data) return null;

    try {
      const decoded = atob(data);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }, [data]);

  useEffect(()=>{
    coursePaymentverification(data);
  },[data])

  const coursePaymentverification = async(data)=>{
    try{
      console.log("This is data",data);
      const dt = await verifyCoursePayment(payment);
      console.log("THis is dt",dt);


    }
    catch(err){
      console.log("THis is err",err);

    }

  }



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Payment Successful
        </h1>

        <p className="text-gray-600 mt-2">
          Thank you! Your payment has been processed successfully.
        </p>

        {/* Payment details */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-medium">
              {payment?.transaction_uuid || "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Amount Paid</span>
            <span className="font-medium">
              Rs. {payment?.total_amount || "—"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Link
            to="/user/my-courses"
            className="block w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
          >
            Go to My Courses
          </Link>

          <Link
            to="/"
            className="block w-full text-gray-600 hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsewaSuccess;