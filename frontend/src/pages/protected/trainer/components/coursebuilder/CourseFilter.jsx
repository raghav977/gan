import React from "react";

const CourseFilters = ({ filters, setFilters, onSearch }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
      {/* Search */}
      <input
        type="text"
        name="search"
        placeholder="Search courses..."
        value={filters.search}
        onChange={handleChange}
        className="border px-3 py-2 rounded w-full md:w-1/3"
      />

      {/* Status Filter */}
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="border px-3 py-2 rounded w-full md:w-48"
      >
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      {/* Search Button */}
      <button
        onClick={onSearch}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Apply
      </button>
    </div>
  );
};

export default CourseFilters;
