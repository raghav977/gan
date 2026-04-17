import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    MdSearch,
    MdRefresh,
    MdSchool,
    MdLayers,
    MdAttachMoney,
    MdChevronLeft,
    MdChevronRight,
    MdOutlineFilterList
} from "react-icons/md";
import { getAdminCourses } from "../../../../api/admin.course";

const statusOptions = [
    { label: "All statuses", value: "" },
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" }
];

const statusStyles = {
    draft: "bg-gray-100 text-gray-600",
    published: "bg-green-100 text-green-700",
    archived: "bg-red-100 text-red-600"
};

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filters, setFilters] = useState({ search: "", status: "" });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getAdminCourses({
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                status: filters.status
            });
            const payload = response?.data || {};
            setCourses(payload.courses || []);
            setPagination((prev) => ({
                ...prev,
                total: payload.total || 0,
                totalPages: payload.totalPages || 1
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters.search, filters.status, pagination.limit, pagination.page]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const handleStatusChange = (value) => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters((prev) => ({ ...prev, status: value }));
    };

    const handlePageChange = (direction) => {
        setPagination((prev) => {
            const next = direction === "next" ? prev.page + 1 : prev.page - 1;
            if (next < 1 || next > prev.totalPages) return prev;
            return { ...prev, page: next };
        });
    };

    const handleRefresh = () => {
        setSearchInput(filters.search);
        fetchCourses();
    };

    const summary = useMemo(() => {
        const total = pagination.total;
        const published = courses.filter((course) => course.status === "published").length;
        const draft = courses.filter((course) => course.status === "draft").length;
        const archived = courses.filter((course) => course.status === "archived").length;
        const avgPrice = courses.length
            ? courses.reduce((sum, course) => sum + Number(course.price || 0), 0) / courses.length
            : 0;

        return {
            total,
            published,
            draft,
            archived,
            avgPrice: Math.round(avgPrice)
        };
    }, [courses, pagination.total]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Course Catalog</h1>
                    <p className="text-gray-500">Review every course trainers have published or drafted.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <MdRefresh /> Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="inline-flex p-3 rounded-xl bg-yellow-100 mb-3">
                        <MdSchool className="text-yellow-600" size={28} />
                    </div>
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <p className="text-3xl font-bold">{summary.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="inline-flex p-3 rounded-xl bg-green-100 mb-3">
                        <MdLayers className="text-green-600" size={28} />
                    </div>
                    <p className="text-sm text-gray-500">Published</p>
                    <p className="text-3xl font-bold text-green-600">{summary.published}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="inline-flex p-3 rounded-xl bg-gray-100 mb-3">
                        <MdLayers className="text-gray-600" size={28} />
                    </div>
                    <p className="text-sm text-gray-500">Drafts</p>
                    <p className="text-3xl font-bold text-gray-700">{summary.draft}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="inline-flex p-3 rounded-xl bg-blue-100 mb-3">
                        <MdAttachMoney className="text-blue-600" size={28} />
                    </div>
                    <p className="text-sm text-gray-500">Avg. Price (page)</p>
                    <p className="text-3xl font-bold">Rs. {summary.avgPrice}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow">
                <div className="p-4 border-b flex flex-col lg:flex-row gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-3">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by course or trainer..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchInput("");
                                setFilters((prev) => ({ ...prev, search: "" }));
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Clear
                        </button>
                    </form>

                    <div className="flex items-center gap-2">
                        <MdOutlineFilterList className="text-gray-500" size={20} />
                        <select
                            value={filters.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                        <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                        <p className="text-gray-500">Loading courses...</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">No courses found for the selected filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-240">
                            <thead className="bg-gray-50 text-left text-sm text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Course</th>
                                    <th className="px-4 py-3 font-semibold">Trainer</th>
                                    <th className="px-4 py-3 font-semibold">Duration</th>
                                    <th className="px-4 py-3 font-semibold">Price</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {course.courseImage && (
                                                    <img
                                                        src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}/${course.courseImage}`}
                                                        alt={course.courseName}
                                                        className="w-14 h-14 rounded object-cover border"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">{course.courseName}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                                                        {course.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-gray-900">{course.trainer?.username || "Unknown"}</p>
                                            <p className="text-xs text-gray-500">{course.trainer?.email}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{course.duration} days</td>
                                        <td className="px-4 py-4 font-semibold text-gray-900">Rs. {course.price}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                statusStyles[course.status] || "bg-gray-100 text-gray-600"
                                            }`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <select
                            value={pagination.limit}
                            onChange={(e) =>
                                setPagination((prev) => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))
                            }
                            className="px-3 py-1 border rounded"
                        >
                            {[10, 20, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => handlePageChange("prev")}
                            disabled={pagination.page === 1}
                            className={`p-2 rounded-lg border ${
                                pagination.page === 1 ? "text-gray-400 bg-gray-100" : "hover:bg-gray-50"
                            }`}
                        >
                            <MdChevronLeft />
                        </button>
                        <button
                            onClick={() => handlePageChange("next")}
                            disabled={pagination.page === pagination.totalPages}
                            className={`p-2 rounded-lg border ${
                                pagination.page === pagination.totalPages
                                    ? "text-gray-400 bg-gray-100"
                                    : "hover:bg-gray-50"
                            }`}
                        >
                            <MdChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCourses;
