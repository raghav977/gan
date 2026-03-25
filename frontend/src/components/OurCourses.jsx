import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTopPublicCourses } from '../api/public.course'
import react_image from '../assets/hero.jpg'

const OurCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getTopPublicCourses();
        setCourses(response.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // Fallback image if courseImage is not available
  const getImageUrl = (courseImage) => {
    if (!courseImage) return react_image;
    // If it's a relative path, prepend the backend URL
    if (courseImage.startsWith('http')) return courseImage;
    console.log(`http://localhost:5001/${courseImage}`);
    return `http://localhost:5001/${courseImage}`;
  };

  

  return (
    <div>
      {/* heading */}
      <div className='text-2xl font-bold mb-4 text-center py-12'>Our Courses</div>

      {/* Loading state */}
      {loading && (
        <div className='text-center py-8 text-gray-500'>Loading courses...</div>
      )}

      {/* Error state */}
      {error && (
        <div className='text-center py-8 text-red-500'>{error}</div>
      )}

      {/* content */}
      {!loading && !error && (
        <div className='max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pb-12'>
          {courses.length === 0 ? (
            <div className='col-span-full text-center text-gray-500'>
              No courses available yet
            </div>
          ) : (
            courses.map((course) => (
              <div 
                key={course.id} 
                className='bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                onClick={() => handleCourseClick(course.id)}
              >
                <img 
                  src={getImageUrl(course.courseImage)} 
                  alt={course.courseName} 
                  className='w-full h-48 object-cover rounded-t-2xl' 
                />
                <div className='p-6'>
                  <h4 className='text-xl font-semibold mb-2'>{course.courseName}</h4>
                  <p className='text-slate-500 text-sm mb-2 line-clamp-2'>
                    {course.description || "No description available"}
                  </p>
                  <div className='flex justify-between items-center mt-4'>
                    <span className='text-sm text-gray-600'>
                      By {course.trainerName}
                    </span>
                    <span className='text-lg font-bold text-yellow-600'>
                      ${course.price}
                    </span>
                  </div>
                  <div className='text-xs text-gray-400 mt-2'>
                    Duration: {course.duration} days
                  </div>
                </div>
              </div>
            ))
          )}

          <div className='flex items-center justify-center col-span-full mt-4'>
            <button 
              onClick={handleViewAllCourses}
              className='bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-700 transition-colors'
            >
              View All Courses
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OurCourses