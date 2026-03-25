import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddCourse from '../components/coursebuilder/AddCourse'
import CourseFilters from '../components/coursebuilder/CourseFilter'
import { getTrainerCourses, updateCourseStatus } from '../../../../api/course'

const CoursesList = () => {
  const navigate = useNavigate()

  const [isAddCourse, setIsAddCourse] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null) // Track which course is being updated

  const [filters, setFilters] = useState({
    search: "",
    status: ""
  })

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await getTrainerCourses({
        page: 1,
        limit: 10,
        search: filters.search,
        status: filters.status
      })
      setCourses(data.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleModalClose = () => {
    setIsAddCourse(false)
    fetchCourses()
  }

  const handleCourse = (courseId) => {
    navigate(`/trainer/courses/${courseId}`)
  }

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      setUpdatingStatus(courseId)
      await updateCourseStatus(courseId, newStatus)
      // Update local state
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, status: newStatus }
            : course
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Your Courses</h1>
        <button
          onClick={() => setIsAddCourse(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded"
        >
          + Add New Course
        </button>
      </div>

      {/* Filters */}
      <CourseFilters
        filters={filters}
        setFilters={setFilters}
        onSearch={fetchCourses}
      />

      {/* Modal */}
      {isAddCourse && <AddCourse onClose={handleModalClose} />}

      {/* States */}
      {loading && <p>Loading courses...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && courses.length === 0 && (
        <p>No courses found. Try adjusting filters 👀</p>
      )}

      {/* Course Cards */}
      {courses.map(course => (
        <div key={course.id} className="mb-4 p-4 border border-gray-300 rounded shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{course.courseName}</h2>
              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(course.status)}`}>
                  {course.status}
                </span>
                <span className="text-xs text-gray-500">
                  ${course.price} • {course.duration} days
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-4 rounded text-sm"
              onClick={() => handleCourse(course.id)}
            >
              Manage Course
            </button>

            {/* Status Change Dropdown */}
            <div className="relative">
              <select
                value={course.status}
                onChange={(e) => handleStatusChange(course.id, e.target.value)}
                disabled={updatingStatus === course.id}
                className={`py-1.5 px-3 rounded text-sm border border-gray-300 bg-white cursor-pointer
                  ${updatingStatus === course.id ? 'opacity-50 cursor-wait' : 'hover:border-gray-400'}
                `}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              {updatingStatus === course.id && (
                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  ...
                </span>
              )}
            </div>

            {course.status === 'draft' && (
              <button
                onClick={() => handleStatusChange(course.id, 'published')}
                disabled={updatingStatus === course.id}
                className="bg-green-500 hover:bg-green-600 text-white py-1.5 px-4 rounded text-sm disabled:opacity-50"
              >
                {updatingStatus === course.id ? 'Publishing...' : 'Publish Now'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CoursesList
