import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnrolledCourseDetail, updateLectureProgress } from '../../../../api/courseEnrollment';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedWeeks, setExpandedWeeks] = useState({});

    useEffect(() => {
        fetchCourseDetail();
    }, [courseId]);

    const fetchCourseDetail = async () => {
        try {
            setLoading(true);
            const response = await getEnrolledCourseDetail(courseId);
            const { course: courseData, enrollment: enrollmentData } = response.data;
            
            setCourse(courseData);
            setEnrollment(enrollmentData);

            // Expand all weeks by default
            const expanded = {};
            courseData.weeks.forEach(week => {
                expanded[week.id] = true;
            });
            setExpandedWeeks(expanded);

            // Set current lecture
            if (enrollmentData.currentLectureId) {
                const lecture = findLectureById(courseData.weeks, enrollmentData.currentLectureId);
                setCurrentLecture(lecture);
            } else if (courseData.weeks?.[0]?.lectures?.[0]) {
                setCurrentLecture(courseData.weeks[0].lectures[0]);
            }
        } catch (err) {
            console.error("Failed to fetch course:", err);
            alert(err.message);
            navigate('/user/my-courses');
        } finally {
            setLoading(false);
        }
    };

    const findLectureById = (weeks, lectureId) => {
        for (const week of weeks) {
            const lecture = week.lectures?.find(l => l.id === lectureId);
            if (lecture) {
                return { ...lecture, weekTitle: week.title, weekId: week.id };
            }
        }
        return null;
    };

    const handleLectureSelect = (lecture, week) => {
        setCurrentLecture({ ...lecture, weekTitle: week.title, weekId: week.id });
        if (videoRef.current) {
            videoRef.current.load();
        }
    };

    const handleMarkComplete = async () => {
        if (!currentLecture) return;
        
        try {
            const response = await updateLectureProgress(courseId, currentLecture.id, !currentLecture.isCompleted);
            
            // Update local state
            setEnrollment(prev => ({
                ...prev,
                progress: response.data.progress,
                completedLectures: response.data.completedLectures
            }));

            // Update lecture completion status
            setCourse(prev => ({
                ...prev,
                weeks: prev.weeks.map(week => ({
                    ...week,
                    lectures: week.lectures.map(lecture => ({
                        ...lecture,
                        isCompleted: response.data.completedLectures.includes(lecture.id)
                    }))
                }))
            }));

            setCurrentLecture(prev => ({
                ...prev,
                isCompleted: !prev.isCompleted
            }));

        } catch (err) {
            console.error("Failed to update progress:", err);
        }
    };

    const goToNextLecture = () => {
        if (!course || !currentLecture) return;
        
        let foundCurrent = false;
        for (const week of course.weeks) {
            for (const lecture of week.lectures) {
                if (foundCurrent) {
                    handleLectureSelect(lecture, week);
                    return;
                }
                if (lecture.id === currentLecture.id) {
                    foundCurrent = true;
                }
            }
        }
    };

    const goToPrevLecture = () => {
        if (!course || !currentLecture) return;
        
        let prevLecture = null;
        let prevWeek = null;
        
        for (const week of course.weeks) {
            for (const lecture of week.lectures) {
                if (lecture.id === currentLecture.id && prevLecture) {
                    handleLectureSelect(prevLecture, prevWeek);
                    return;
                }
                prevLecture = lecture;
                prevWeek = week;
            }
        }
    };

    const toggleWeek = (weekId) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [weekId]: !prev[weekId]
        }));
    };

    const getVideoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5001/${url}`;
    };

    const getResourceUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5001/${url}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Main Content Area - Video Player */}
            <div className={`flex-1 flex flex-col transition-all ${sidebarCollapsed ? 'mr-0' : 'mr-80'}`}>
                {/* Top Navigation */}
                <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                    <button 
                        onClick={() => navigate('/user/my-courses')}
                        className="flex items-center text-gray-300 hover:text-white"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to My Courses
                    </button>
                    
                    <h1 className="text-white font-medium truncate max-w-md">
                        {course.courseName}
                    </h1>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            {enrollment?.progress || 0}% complete
                        </div>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            {sidebarCollapsed ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Video Player Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 bg-black flex items-center justify-center">
                        {currentLecture?.videoUrl ? (
                            <video
                                ref={videoRef}
                                className="w-full h-full"
                                controls
                                autoPlay
                                key={currentLecture.id}
                            >
                                <source src={getVideoUrl(currentLecture.videoUrl)} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="text-center text-gray-400">
                                <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>No video available for this lecture</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="bg-gray-800 border-t border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-400">{currentLecture?.weekTitle}</p>
                                <h2 className="text-xl text-white font-semibold">{currentLecture?.title}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={goToPrevLecture}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleMarkComplete}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        currentLecture?.isCompleted 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    {currentLecture?.isCompleted ? '✓ Completed' : 'Mark as Complete'}
                                </button>
                                <button
                                    onClick={goToNextLecture}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Resources Section */}
                        {currentLecture?.resourceUrl && (
                            <div className="border-t border-gray-700 pt-4">
                                <h3 className="text-white font-medium mb-2">📎 Resources</h3>
                                <a
                                    href={getResourceUrl(currentLecture.resourceUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Resource
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar - Course Content */}
            <div 
                className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform ${
                    sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'
                }`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="font-bold text-gray-800">Course Content</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {enrollment?.completedLectures?.length || 0} of {course.totalLectures} completed
                        </p>
                        {/* Progress Bar */}
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${enrollment?.progress || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Weeks and Lectures List */}
                    <div className="flex-1 overflow-y-auto">
                        {course.weeks?.map((week, weekIndex) => (
                            <div key={week.id} className="border-b">
                                {/* Week Header */}
                                <button
                                    onClick={() => toggleWeek(week.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                            {weekIndex + 1}
                                        </span>
                                        <span className="font-medium text-gray-800 text-left">{week.title}</span>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedWeeks[week.id] ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Lectures */}
                                {expandedWeeks[week.id] && (
                                    <div className="bg-gray-50">
                                        {week.lectures?.map((lecture, lectureIndex) => (
                                            <button
                                                key={lecture.id}
                                                onClick={() => handleLectureSelect(lecture, week)}
                                                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                                                    currentLecture?.id === lecture.id ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                                                }`}
                                            >
                                                {/* Completion Checkbox */}
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                                                    lecture.isCompleted 
                                                        ? 'bg-green-500 border-green-500' 
                                                        : 'border-gray-300'
                                                }`}>
                                                    {lecture.isCompleted && (
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Lecture Info */}
                                                <div className="flex-1">
                                                    <p className={`text-sm ${currentLecture?.id === lecture.id ? 'font-medium text-yellow-700' : 'text-gray-700'}`}>
                                                        {lectureIndex + 1}. {lecture.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {lecture.videoUrl && (
                                                            <span className="text-xs text-gray-400 flex items-center">
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M8 5v14l11-7z" />
                                                                </svg>
                                                                Video
                                                            </span>
                                                        )}
                                                        {lecture.resourceUrl && (
                                                            <span className="text-xs text-gray-400 flex items-center">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Resource
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Playing Indicator */}
                                                {currentLecture?.id === lecture.id && (
                                                    <div className="w-6 h-6 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
