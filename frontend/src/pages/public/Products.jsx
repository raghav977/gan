import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPublicProducts } from '../../api/public.product';
import Header from '../../components/Header';
import ProductFilters from '../../components/ProductFilters';

const Products = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || "");
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || "");
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || "");
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || "createdAt");
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || "DESC");

    const [showFilters, setShowFilters] = useState(false);

    const limit = 12;

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getPublicProducts({
                page: currentPage,
                limit,
                search,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                sortBy,
                sortOrder
            });

            setProducts(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotal(response.total || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, minPrice, maxPrice, sortBy, sortOrder]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams();
        if (currentPage > 1) params.set('page', currentPage.toString());
        if (search) params.set('search', search);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
        if (sortOrder !== 'DESC') params.set('sortOrder', sortOrder);
        setSearchParams(params);
    }, [currentPage, search, minPrice, maxPrice, sortBy, sortOrder, setSearchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchInput("");
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("createdAt");
        setSortOrder("DESC");
        setCurrentPage(1);
    };

    const handleApplyFilters = (filters) => {
        setMinPrice(filters.minPrice);
        setMaxPrice(filters.maxPrice);
        setSortBy(filters.sortBy);
        setSortOrder(filters.sortOrder);
        setCurrentPage(1);
        setShowFilters(false);
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5001/${imagePath}`;
    };

    const hasActiveFilters = search || minPrice || maxPrice || sortBy !== 'createdAt' || sortOrder !== 'DESC';

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-4">Our Products</h1>
                    <p className="text-gray-600">Discover our premium fitness products</p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => { setSearchInput(""); setSearch(""); setCurrentPage(1); }}
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

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 border rounded-lg flex items-center gap-2 transition-colors ${
                                hasActiveFilters ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                            {hasActiveFilters && <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <ProductFilters
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onApply={handleApplyFilters}
                            onClear={handleClearFilters}
                            onClose={() => setShowFilters(false)}
                        />
                    )}

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {search && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    Search: {search}
                                </span>
                            )}
                            {(minPrice || maxPrice) && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    Price: ${minPrice || '0'} - ${maxPrice || '∞'}
                                </span>
                            )}
                            {sortBy !== 'createdAt' && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    Sort: {sortBy === 'productPrice' ? 'Price' : 'Name'} ({sortOrder === 'DESC' ? 'High to Low' : 'Low to High'})
                                </span>
                            )}
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                {!loading && (
                    <div className="mb-6 text-gray-600">
                        {total} product{total !== 1 ? 's' : ''} found
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-500">Loading products...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button onClick={fetchProducts} className="px-4 py-2 bg-yellow-600 text-white rounded-lg">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <>
                        {products.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">No products found</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="mt-4 text-yellow-600 hover:underline"
                                    >
                                        Clear filters and try again
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <div className="h-48 bg-gray-100 overflow-hidden">
                                            {getImageUrl(product.productImage) ? (
                                                <img
                                                    src={getImageUrl(product.productImage)}
                                                    alt={product.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                                                {product.productName}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                                {product.productDescription || "No description"}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold text-yellow-600">
                                                    ${product.productPrice?.toFixed(2)}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    product.productStock > 0 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {product.productStock > 0 ? 'In Stock' : 'Out of Stock'}
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
                                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg ${
                                        currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-50'
                                    }`}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`px-4 py-2 rounded-lg ${
                                                pageNum === currentPage ? 'bg-yellow-600 text-white' : 'bg-white border hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg ${
                                        currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-50'
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
    );
};

export default Products;
