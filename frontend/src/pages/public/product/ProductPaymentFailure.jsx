import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const ProductPaymentFailure = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <FaTimesCircle className="text-red-500 text-5xl" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800">Payment Failed</h1>
        <p className="text-gray-600 mt-2">
          We couldn't process your payment. Please try again or contact support if the issue persists.
        </p>

        <div className="mt-6 space-y-3">
          <Link
            to="/user/my-products?tab=cart"
            className="block w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg transition"
          >
            Return to Cart
          </Link>
          <Link
            to="/products"
            className="block w-full text-gray-600 hover:underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductPaymentFailure;
