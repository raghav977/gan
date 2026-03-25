import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTopProducts } from "../api/public.product";

const OurProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getTopProducts(6);
        setProducts(response.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5001/${imagePath}`;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Products</h2>
          <p className="text-gray-600">Premium fitness products to enhance your training</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-8 text-red-500">{error}</div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products available yet
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
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

            {/* View All Button */}
            {products.length > 0 && (
              <div className="text-center mt-10">
                <button
                  onClick={handleViewAllProducts}
                  className="px-8 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  View All Products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default OurProducts;