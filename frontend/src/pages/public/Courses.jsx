import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPublicCourses } from '../../api/public.course'
import Header from '../../components/Header'
import react_image from '../../assets/hero.jpg'

const Courses = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || "");
  
  const limit = 9; // 3x3 grid

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await getPublicCourses({
        limit,
        page: currentPage,
        search: searchTerm
      });
      
      setCourses(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Update URL params when search or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params);
  }, [currentPage, searchTerm, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // Fallback image if courseImage is not available
  const getImageUrl = (courseImage) => {
    if (!courseImage) return react_image;
    if (courseImage.startsWith('http')) return courseImage;
    return `http://localhost:5001/${courseImage}`;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-gray-600">Find the perfect course to enhance your fitness journey</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by course name or trainer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Search
            </button>
          </form>
          
          {/* Search info */}
          {searchTerm && (
            <div className="text-center mt-4 text-gray-600">
              Showing results for "<span className="font-semibold">{searchTerm}</span>" 
              <button 
                onClick={handleClearSearch}
                className="ml-2 text-yellow-600 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-6 text-gray-600">
            {total} course{total !== 1 ? 's' : ''} found
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading courses...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchCourses}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No courses found</p>
                {searchTerm && (
                  <p className="text-gray-400 mt-2">
                    Try a different search term or{' '}
                    <button onClick={handleClearSearch} className="text-yellow-600 hover:underline">
                      view all courses
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <img
                      src={getImageUrl(course.courseImage)}
                      alt={course.courseName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                        {course.courseName}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {course.description || "No description available"}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">By {course.trainerName}</p>
                          <p className="text-xs text-gray-400">{course.duration} days</p>
                        </div>
                        <span className="text-xl font-bold text-yellow-600">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      page === currentPage
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Courses
