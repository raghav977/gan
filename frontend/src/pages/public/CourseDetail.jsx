import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPublicCourseDetail } from '../../api/public.course';
import { checkCourseEnrollment, enrollInCourse } from '../../api/courseEnrollment';
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedWeeks, setExpandedWeeks] = useState({});
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        fetchCourseDetail();
    }, [courseId]);

    useEffect(() => {
        if (isAuthenticated && courseId) {
            checkEnrollment();
        }
    }, [isAuthenticated, courseId]);

    const checkEnrollment = async () => {
        try {
            const response = await checkCourseEnrollment(courseId);
            setEnrollmentStatus(response.data);
        } catch (err) {
            console.error("Check enrollment error:", err);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            const d = await enrollInCourse(courseId);
              const form = document.createElement("form");
                form.method = "POST";

                  form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

                  const fields = {
                  amount: d.data.amount,
tax_amount: d.data.tax_amount,
total_amount: d.data.total_amount,

    transaction_uuid: d.data.transaction_uuid,
    product_code: "EPAYTEST",
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: "http://localhost:5173/course/payment/success",
    failure_url: "http://localhost:5173/course/payment/failure",
    signature:d.data.signature,
    signed_field_names:d.data.signed_field_names,
                  }
            console.log("THis is d",d);
            for (let key in fields) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = fields[key];
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();

            setEnrollmentStatus({ enrolled: true, status: 'active' });
            // Navigate to course player
            // navigate(`/user/my-courses/${courseId}`);
        } catch (err) {
            alert(err.message);
        } finally {
            setEnrolling(false);
        }
    };

    const getCourseImage = (image)=>{
        if(image.startsWith("http")){
            return image;
        }
        return `http://localhost:5001/${image}`
    }
    const fetchCourseDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getPublicCourseDetail(courseId);
            setCourse(response.data);
            
            if (response.data?.syllabus?.length > 0) {
                setExpandedWeeks({ [response.data.syllabus[0].id]: true });
            }
        } catch (err) {
            setError(err.message || 'Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const toggleWeek = (weekId) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [weekId]: !prev[weekId]
        }));
    };

    const expandAllWeeks = () => {
        if (course?.syllabus) {
            const allExpanded = {};
            course.syllabus.forEach(week => {
                allExpanded[week.id] = true;
            });
            setExpandedWeeks(allExpanded);
        }
    };

    const collapseAllWeeks = () => {
        setExpandedWeeks({});
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading course...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                        Browse All Courses
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Course Header */}
            <div className="bg-[#F0B100] text-white">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <button
                        onClick={() => navigate('/courses')}
                        className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Courses
                    </button>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Course Info */}
                        <div className="md:col-span-2">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {course.courseName}
                            </h1>
                            <p className="text-lg text-white/90 mb-6">
                                {course.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    By {course.trainerName}
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {course.duration}
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    {course.totalWeeks} Weeks • {course.totalLectures} Lectures
                                </div>
                            </div>
                        </div>

                        {/* Course Card */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden text-gray-800">
                            {course.courseImage && (
                                <img
                                    src={getCourseImage(course.courseImage)}
                                    alt={course.courseName}
                                    className="w-full h-80 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <div className="text-3xl font-bold text-yellow-600 mb-4">
                                    Rs {course.price}
                                </div>
                                {enrollmentStatus?.enrolled ? (
                                    <button 
                                        onClick={() => navigate(`/user/my-courses/${courseId}`)}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors mb-3"
                                    >
                                        Continue Learning →
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="w-full py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors mb-3 disabled:opacity-50"
                                    >
                                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                )}
                                <p className="text-center text-sm text-gray-500">
                                    Full lifetime access
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Syllabus */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Course Syllabus</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={expandAllWeeks}
                            className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                            Expand All
                        </button>
                        <button
                            onClick={collapseAllWeeks}
                            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Collapse All
                        </button>
                    </div>
                </div>

                {course.syllabus && course.syllabus.length > 0 ? (
                    <div className="space-y-4">
                        {course.syllabus.map((week, index) => (
                            <div key={week.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Week Header */}
                                <button
                                    onClick={() => toggleWeek(week.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold mr-4">
                                            {index + 1}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-gray-800">{week.title}</h3>
                                            {week.description && (
                                                <p className="text-sm text-gray-500">{week.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500">
                                            {week.lectureCount} {week.lectureCount === 1 ? 'lecture' : 'lectures'}
                                        </span>
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedWeeks[week.id] ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Week Content - Lecture List */}
                                {expandedWeeks[week.id] && week.lectures && week.lectures.length > 0 && (
                                    <div className="border-t border-gray-200 bg-gray-50">
                                        {week.lectures.map((lecture, lectureIndex) => (
                                            <div
                                                key={lecture.id}
                                                className="flex items-center px-4 py-3 border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                                                    <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700">{lecture.title}</span>
                                                <span className="ml-auto text-sm text-gray-400">
                                                    Lecture {lectureIndex + 1}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Empty lectures message */}
                                {expandedWeeks[week.id] && (!week.lectures || week.lectures.length === 0) && (
                                    <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
                                        No lectures in this week yet.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <div className="text-gray-400 text-4xl mb-4">📚</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Syllabus Coming Soon</h3>
                        <p className="text-gray-600">The course curriculum is being prepared.</p>
                    </div>
                )}
            </div>

            {/* What You'll Learn Section */}
            <div className="bg-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">What You'll Learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {course.syllabus && course.syllabus.slice(0, 6).map((week, index) => (
                            <div key={week.id} className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-700">{week.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Instructor Section */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Instructor</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl mr-6">
                        {course.trainerName?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">{course.trainerName}</h3>
                        <p className="text-gray-600">Professional Instructor</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
