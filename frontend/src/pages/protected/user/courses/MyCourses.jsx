import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCourses } from '../../../../api/courseEnrollment';

const MyCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed

    useEffect(() => {
        fetchMyCourses();
    }, [filter]);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? null : filter;
            const response = await getMyCourses(status);
            setCourses(response.data || []);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
        } finally {
            setLoading(false);
        }
    };

    const getCourseImage = (image) => {
        if (!image) return 'https://via.placeholder.com/300x200?text=Course';
        if (image.startsWith('http')) return image;
        return `http://localhost:5001/${image}`;
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
                
                {/* Filter */}
                <div className="flex gap-2">
                    {['all', 'active', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === f 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h2>
                    <p className="text-gray-500 mb-4">
                        {filter === 'completed' 
                            ? "You haven't completed any courses yet."
                            : "You haven't enrolled in any courses yet."}
                    </p>
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((enrollment) => (
                        <div 
                            key={enrollment.id}
                            onClick={() => navigate(`/user/my-courses/${enrollment.courseId}`)}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                        >
                            {/* Course Image */}
                            <div className="relative">
                                <img
                                    src={getCourseImage(enrollment.course?.courseImage)}
                                    alt={enrollment.course?.courseName}
                                    className="w-full h-40 object-cover"
                                />
                                {enrollment.status === 'completed' && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        ✓ Completed
                                    </div>
                                )}
                            </div>

                            {/* Course Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                                    {enrollment.course?.courseName}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    By {enrollment.course?.trainerName}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>{enrollment.completedLectures?.length || 0} of {enrollment.course?.totalLectures || 0} lectures</span>
                                        <span>{enrollment.progress}% complete</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all ${getProgressColor(enrollment.progress)}`}
                                            style={{ width: `${enrollment.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                <button className="w-full py-2 mt-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
                                    {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
