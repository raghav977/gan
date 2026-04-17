import React, { useEffect, useMemo, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyProductPayment } from '../../../api/userProduct';

const ProductPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const data = searchParams.get('data');
  const [status, setStatus] = useState('verifying');

  const payment = useMemo(() => {
    if (!data) return null;
    try {
      const decoded = atob(data);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }, [data]);

  useEffect(() => {
    const verify = async () => {
      if (!payment) {
        setStatus('invalid');
        return;
      }
      try {
        await verifyProductPayment(payment);
        setStatus('verified');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [payment]);

  const statusMessage = {
    verifying: 'Confirming your payment... hold on tight.',
    verified: 'Thank you! Your payment has been processed successfully.',
    error: 'We could not verify this payment. Please contact support.',
    invalid: 'Payment data is missing. Please try again.'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800">
          Product Payment
        </h1>
        <p className="text-gray-600 mt-2">{statusMessage[status]}</p>

        {payment && (
          <div className="bg-gray-100 rounded-lg p-4 mt-6 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium">{payment.transaction_uuid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-medium">Rs. {payment.total_amount}</span>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <Link
            to="/user/my-products?tab=purchased"
            className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition"
          >
            View My Products
          </Link>

          <Link
            to="/products"
            className="block w-full text-gray-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductPaymentSuccess;
