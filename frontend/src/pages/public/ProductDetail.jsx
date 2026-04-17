import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPublicProductDetail } from '../../api/public.product';
import Header from '../../components/Header';
import { addProductToCart, purchaseCartItems } from '../../api/userProduct';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [adding, setAdding] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getPublicProductDetail(productId);
            setProduct(response.data);
        } catch (err) {
            setError(err.message || "Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5001/${imagePath}`;
    };

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, Math.min(product?.productStock || 10, prev + delta)));
    };

    const ensureAuthenticated = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return false;
        }
        return true;
    };

    const enqueueProduct = async () => {
        if (!product) return { success: false };
        try {
            await addProductToCart(product.id, quantity);
            return { success: true, alreadyInCart: false };
        } catch (err) {
            if (err.message?.toLowerCase().includes('already')) {
                return { success: true, alreadyInCart: true };
            }
            throw err;
        }
    };

    const createEsewaForm = (fields) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
        Object.entries(fields).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
    };

    const handleAddToCart = async () => {
        if (!ensureAuthenticated()) return;
        setFeedback("");
        setAdding(true);
        try {
            const result = await enqueueProduct();
            setFeedback(result.alreadyInCart ? "Product is already in your cart" : "Product added to cart");
        } catch (err) {
            setFeedback(err.message || "Unable to add product to cart");
        } finally {
            setAdding(false);
        }
    };

    const handleBuyNow = async () => {
        if (!ensureAuthenticated()) return;
        setFeedback("");
        setCheckingOut(true);
        try {
            const result = await enqueueProduct();
            if (!result.success) {
                throw new Error("Unable to prepare cart");
            }

            const paymentPayload = await purchaseCartItems();
            if (!paymentPayload) {
                throw new Error("Unable to initiate payment");
            }

            createEsewaForm({
                amount: paymentPayload.amount,
                tax_amount: paymentPayload.tax_amount,
                total_amount: paymentPayload.total_amount,
                transaction_uuid: paymentPayload.transaction_uuid,
                product_code: paymentPayload.product_code,
                product_service_charge: paymentPayload.product_service_charge || 0,
                product_delivery_charge: paymentPayload.product_delivery_charge || 0,
                success_url: paymentPayload.success_url,
                failure_url: paymentPayload.failure_url,
                signature: paymentPayload.signature,
                signed_field_names: paymentPayload.signed_field_names
            });
        } catch (err) {
            setFeedback(err.message || "Unable to start checkout");
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading product...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                            Browse All Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex items-center gap-2 text-sm text-gray-500">
                        <li>
                            <button onClick={() => navigate('/')} className="hover:text-yellow-600">
                                Home
                            </button>
                        </li>
                        <li>/</li>
                        <li>
                            <button onClick={() => navigate('/products')} className="hover:text-yellow-600">
                                Products
                            </button>
                        </li>
                        <li>/</li>
                        <li className="text-gray-800 font-medium truncate max-w-xs">
                            {product.productName}
                        </li>
                    </ol>
                </nav>

                {/* Product Details */}
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {getImageUrl(product.productImage) ? (
                            <img
                                src={getImageUrl(product.productImage)}
                                alt={product.productName}
                                className="w-full h-96 md:h-125 object-cover"
                            />
                        ) : (
                            <div className="w-full h-96 md:h-125 bg-gray-100 flex items-center justify-center text-gray-400">
                                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            {product.productName}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-3xl font-bold text-yellow-600">
                                ${product.productPrice?.toFixed(2)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                product.productStock > 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {product.productStock > 0 
                                    ? `${product.productStock} in stock` 
                                    : 'Out of Stock'}
                            </span>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.productDescription || "No description available for this product."}
                            </p>
                        </div>

                        {/* Quantity Selector */}
                        {product.productStock > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            −
                                        </button>
                                        <span className="px-4 py-2 font-medium">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.productStock}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Max: {product.productStock}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={product.productStock === 0 || checkingOut}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                                        product.productStock > 0
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {checkingOut ? 'Processing...' : 'Buy Now'}
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.productStock === 0 || adding}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                                        product.productStock > 0
                                            ? 'bg-white border border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {product.productStock > 0 ? (adding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
                                </button>
                                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                            {feedback && (
                                <p className="text-sm text-gray-600">{feedback}</p>
                            )}
                        </div>

                        {/* Product Meta */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Product ID:</span>
                                    <span className="ml-2 font-medium">{product.id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Added:</span>
                                    <span className="ml-2 font-medium">
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Products */}
                <div className="mt-12">
                    <button
                        onClick={() => navigate('/products')}
                        className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Products
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
