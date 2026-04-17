import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdSearch, MdRefresh, MdFilterList, MdChevronLeft, MdChevronRight, MdShoppingBag } from "react-icons/md";
import { getOrderedProducts } from "../../../../api/admin.product";

const statusOptions = [
    { label: "Purchased", value: "PURCHASED" },
    { label: "Pending", value: "PENDING" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "All", value: "" }
];

const formatCurrency = (value) => {
    const amount = Number(value || 0);
    if (Number.isNaN(amount)) return "Rs. 0.00";
    return `Rs. ${amount.toFixed(2)}`;
};

const formatDate = (value) => {
    if (!value) return "-";
    try {
        return new Date(value).toLocaleString();
    } catch (err) {
        return value;
    }
};

const StatusBadge = ({ status }) => {
    const map = {
        PURCHASED: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        CANCELLED: "bg-red-100 text-red-600"
    };
    const classes = map[status] || "bg-gray-100 text-gray-600";
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${classes}`}>
            {status?.toLowerCase() || "unknown"}
        </span>
    );
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filters, setFilters] = useState({
        status: "PURCHASED",
        search: ""
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await getOrderedProducts({
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status,
                search: filters.search
            });
            const data = response.data || {};
            setOrders(data.orders || []);
            setPagination((prev) => ({
                ...prev,
                total: data.total || 0,
                totalPages: data.totalPages || 1
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters.search, filters.status, pagination.limit, pagination.page]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    };

    const handleStatusChange = (value) => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setFilters((prev) => ({ ...prev, status: value }));
    };

    const handleRefresh = () => {
        setSearchInput(filters.search);
        fetchOrders();
    };

    const summary = useMemo(() => ({
        currentRange: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0)
    }), [orders]);

    const handlePageChange = (direction) => {
        setPagination((prev) => {
            const nextPage = direction === "next" ? prev.page + 1 : prev.page - 1;
            if (nextPage < 1 || nextPage > prev.totalPages) return prev;
            return { ...prev, page: nextPage };
        });
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Product Orders</h1>
                    <p className="text-gray-500">Monitor every item that has been purchased across the platform.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                    <MdRefresh /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                        <MdShoppingBag className="text-yellow-600" size={28} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{summary.currentRange}</p>
                        <p className="text-sm text-gray-500">Orders (current page)</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <p>Status Filter</p>
                        <MdFilterList className="text-gray-400" size={18} />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="mt-2 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <p className="text-sm text-gray-500">Revenue (current page)</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(summary.totalAmount)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow mb-6">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 p-4 border-b">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by product, buyer, or email..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div className="flex items-center gap-3">
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
                    </div>
                </form>

                {error && (
                    <div className="px-4 py-3 text-red-600 bg-red-50 border-b border-red-100">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                        <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                        <p className="text-gray-500">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        No orders found for the selected filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-180">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500">Order #</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500">Buyer</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500">Product</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500">Qty</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500">Total Paid</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-500">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm text-gray-700">#{order.id}</td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{order.buyer?.username || "Unknown"}</div>
                                            <div className="text-xs text-gray-500">{order.buyer?.email}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {order.product?.productImage && (
                                                    <img
                                                        src={`http://localhost:5001/${order.product.productImage}`}
                                                        alt={order.product.productName}
                                                        className="w-12 h-12 rounded object-cover border"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {order.product?.productName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{formatCurrency(order.product?.productPrice)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{order.quantity}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                                            {formatCurrency(order.totalPrice)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {formatDate(order.updatedAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex items-center justify-between p-4 border-t">
                    <p className="text-sm text-gray-500">
                        Showing page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange("prev")}
                            disabled={pagination.page === 1}
                            className={`p-2 rounded-lg border ${
                                pagination.page === 1 ? "text-gray-400 bg-gray-100" : "hover:bg-gray-50"
                            }`}
                        >
                            <MdChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => handlePageChange("next")}
                            disabled={pagination.page === pagination.totalPages}
                            className={`p-2 rounded-lg border ${
                                pagination.page === pagination.totalPages ? "text-gray-400 bg-gray-100" : "hover:bg-gray-50"
                            }`}
                        >
                            <MdChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
