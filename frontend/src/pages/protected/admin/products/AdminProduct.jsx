import React, { useState, useEffect, useCallback } from 'react'
import AddProduct from '../components/AddProduct';
import ProductCard from '../components/ProductCard';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { createProduct, getAllProducts, updateProduct, deleteProduct } from '../../../../api/admin.product';

const AdminProduct = () => {
    const [products, setProducts] = useState([]);
    const [openModal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Edit state
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Delete state
    const [deleteModal, setDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    
    const limit = 10;

    const fetchProducts = useCallback(async () => {
        try {
            setPageLoading(true);
            setError("");
            const response = await getAllProducts({ page: currentPage, limit, search });
            setProducts(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotal(response.total || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setPageLoading(false);
        }
    }, [currentPage, search]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleModalOpenClose = () => {
        setModal(!openModal);
        setEditingProduct(null);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearch("");
        setCurrentPage(1);
    };

    const handleCreateProduct = async (form) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("productName", form.productName);
            formData.append("productPrice", form.price);
            formData.append("productDescription", form.description);
            formData.append("productStock", form.stock || 0);
            if (form.image) {
                formData.append("productImage", form.image);
            }

            await createProduct(formData);
            setModal(false);
            fetchProducts();
        } catch (err) {
            console.error("Error creating product:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setModal(true);
    };

    const handleUpdateProduct = async (form) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("productName", form.productName);
            formData.append("productPrice", form.price);
            formData.append("productDescription", form.description);
            formData.append("productStock", form.stock || 0);
            if (form.image) {
                formData.append("productImage", form.image);
            }

            await updateProduct(editingProduct.id, formData);
            setModal(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (err) {
            console.error("Error updating product:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setDeleteLoading(true);
            await deleteProduct(productToDelete.id);
            setDeleteModal(false);
            setProductToDelete(null);
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product:", err.message);
            setError(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5001/${imagePath}`;
    };

    return (
        <div className='p-6'>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className='text-2xl font-bold'>Manage Products</h1>
                    <p className='text-gray-500'>Total: {total} products</p>
                </div>
                <button 
                    className='px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors' 
                    onClick={handleModalOpenClose}
                >
                    + Add Product
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                        Search
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                    <button onClick={() => setError("")} className="ml-2 font-bold">×</button>
                </div>
            )}

            {/* Loading */}
            {pageLoading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-500">Loading products...</p>
                </div>
            )}

            {/* Products Grid */}
            {!pageLoading && (
                <>
                    {products.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">No products found</p>
                            <button
                                onClick={handleModalOpenClose}
                                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg"
                            >
                                Add Your First Product
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    imageUrl={getImageUrl(product.productImage)}
                                    onEdit={() => handleEditClick(product)}
                                    onDelete={() => handleDeleteClick(product)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white border hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Product Modal */}
            {openModal && (
                <AddProduct
                    onClose={handleModalOpenClose}
                    onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                    loading={loading}
                    initialData={editingProduct ? {
                        productName: editingProduct.productName,
                        price: editingProduct.productPrice,
                        description: editingProduct.productDescription,
                        stock: editingProduct.productStock
                    } : {}}
                    isEdit={!!editingProduct}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <DeleteConfirmModal
                    title="Delete Product"
                    message={`Are you sure you want to delete "${productToDelete?.productName}"?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { setDeleteModal(false); setProductToDelete(null); }}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
};

export default AdminProduct;