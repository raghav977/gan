import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCartArrowDown } from "react-icons/fa";
import { BiLogoProductHunt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { getUserProductsByStatus, purchaseCartItems, removeCartItem } from '../../../../api/userProduct';

const tabs = [
    { key: 'cart', label: 'Cart Items', icon: FaCartArrowDown, status: 'PENDING' },
    { key: 'purchased', label: 'Purchased Items', icon: BiLogoProductHunt, status: 'PURCHASED' }
];

const formatCurrency = (value) => `Rs. ${value?.toFixed(2) ?? '0.00'}`;

const UserProduct = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') === 'purchased' ? 'purchased' : 'cart';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setSearchParams({ tab: activeTab });
    }, [activeTab, setSearchParams]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const status = tabs.find(tab => tab.key === activeTab)?.status || 'PENDING';
            const response = await getUserProductsByStatus({ status });
            setItems(response.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const cartTotal = useMemo(() => {
        if (activeTab !== 'cart') return 0;
        return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }, [items, activeTab]);

    const handleRemove = async (id) => {
        setProcessing(true);
        try {
            await removeCartItem(id);
            await fetchItems();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
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

    const handleCheckout = async () => {
        setProcessing(true);
        setError('');
        try {
            const paymentPayload = await purchaseCartItems();
            if (!paymentPayload) {
                throw new Error('Unable to initiate payment');
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
            setError(err.message || 'Unable to start checkout');
        } finally {
            setProcessing(false);
        }
    };

    const renderCartItems = () => {
        if (items.length === 0) {
            return (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <p className="text-gray-500">Your cart is empty.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold">{item.product?.name}</h3>
                            <p className="text-gray-500 text-sm mt-1">{item.product?.description}</p>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                <span>Quantity: {item.quantity}</span>
                                <span>Unit Price: {formatCurrency((item.totalPrice || 0) / (item.quantity || 1))}</span>
                                <span>Total: {formatCurrency(item.totalPrice)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleRemove(item.id)}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <MdDelete /> Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderPurchasedItems = () => {
        if (items.length === 0) {
            return (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <p className="text-gray-500">You haven't purchased any products yet.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold">{item.product?.name}</h3>
                                <p className="text-gray-500 text-sm">{item.product?.description}</p>
                            </div>
                            <div className="text-gray-600 text-sm">
                                Purchased on {new Date(item.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-4">
                            <span>Quantity: {item.quantity}</span>
                            <span>Total Paid: {formatCurrency(item.totalPrice)}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Products</h1>

            <div className="flex gap-4 mb-6 border-b">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                            activeTab === key
                                ? 'border-yellow-500 text-yellow-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Icon size={20} />
                        {label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-4 py-2">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-500">Loading...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'cart' ? renderCartItems() : renderPurchasedItems()}

                    {activeTab === 'cart' && items.length > 0 && (
                        <div className="mt-8 bg-white rounded-xl shadow p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">Subtotal</p>
                                    <p className="text-2xl font-semibold text-gray-800">{formatCurrency(cartTotal)}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={fetchItems}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Refresh
                                    </button>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={processing}
                                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Proceed to Payment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserProduct;