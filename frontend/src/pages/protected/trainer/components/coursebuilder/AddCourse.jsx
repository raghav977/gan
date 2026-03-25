import React, { useState } from "react";
import { createCourse } from "../../../../../api/course";

export default function AddCourseModal({ onClose }) {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    status: "draft",
    courseImage: null,
  });

  const [error,setError] = useState("");
  const [message,setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setCourseData((prev) => ({ ...prev, courseImage: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    console.log(courseData); 
    const formData = new FormData();
    formData.append('title',courseData.title)
    formData.append('description',courseData.description)
    formData.append('duration',courseData.duration)
    formData.append('price',courseData.price)
    formData.append('status',courseData.status)
    formData.append('courseImage',courseData.courseImage)
    
    try{
        
        const submitCourse =await createCourse(formData);
        console.log("THis is submit course",submitCourse);

        setMessage(submitCourse.message)
        
    }
    catch(err){
        console.log("This is error from add coursewala",err.message);
        setError(err.message);
        
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
      {/* Modal Box */}
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative animate-fadeIn"  onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Create New Course</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            placeholder="Course Title"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            name="description"
            placeholder="Course Description"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="duration"
            placeholder="Duration (e.g. 6 weeks)"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <select
            name="status"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <input type="file" className="border p-3" accept="image/*" onChange={handleFileChange} />

          <p className="text-red-500">
            {error && error}
          </p>
           <p className="text-blue-800">
            {message && message}
          </p>

          <button className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded font-medium">
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
}
