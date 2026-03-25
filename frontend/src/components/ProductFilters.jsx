import React, { useState } from 'react';

const ProductFilters = ({ minPrice, maxPrice, sortBy, sortOrder, onApply, onClear, onClose }) => {
    const [localMinPrice, setLocalMinPrice] = useState(minPrice);
    const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
    const [localSortBy, setLocalSortBy] = useState(sortBy);
    const [localSortOrder, setLocalSortOrder] = useState(sortOrder);

    const handleApply = () => {
        onApply({
            minPrice: localMinPrice,
            maxPrice: localMaxPrice,
            sortBy: localSortBy,
            sortOrder: localSortOrder
        });
    };

    const handleClear = () => {
        setLocalMinPrice("");
        setLocalMaxPrice("");
        setLocalSortBy("createdAt");
        setLocalSortOrder("DESC");
        onClear();
    };

    // Preset price ranges
    const priceRanges = [
        { label: "Under $25", min: "", max: "25" },
        { label: "$25 - $50", min: "25", max: "50" },
        { label: "$50 - $100", min: "50", max: "100" },
        { label: "$100 - $200", min: "100", max: "200" },
        { label: "Over $200", min: "200", max: "" }
    ];

    const handlePriceRangeClick = (min, max) => {
        setLocalMinPrice(min);
        setLocalMaxPrice(max);
    };

    return (
        <div className="mt-4 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    
                    {/* Preset ranges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {priceRanges.map((range, index) => (
                            <button
                                key={index}
                                onClick={() => handlePriceRangeClick(range.min, range.max)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                    localMinPrice === range.min && localMaxPrice === range.max
                                        ? 'bg-yellow-500 text-white border-yellow-500'
                                        : 'bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom range */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <input
                                type="number"
                                placeholder="Min"
                                value={localMinPrice}
                                onChange={(e) => setLocalMinPrice(e.target.value)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="flex-1">
                            <input
                                type="number"
                                placeholder="Max"
                                value={localMaxPrice}
                                onChange={(e) => setLocalMaxPrice(e.target.value)}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Sort By */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                        value={localSortBy}
                        onChange={(e) => setLocalSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                        <option value="createdAt">Newest First</option>
                        <option value="productPrice">Price</option>
                        <option value="productName">Name</option>
                    </select>
                </div>

                {/* Sort Order */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setLocalSortOrder("ASC")}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                                localSortOrder === "ASC"
                                    ? 'bg-yellow-500 text-white border-yellow-500'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {localSortBy === 'productPrice' ? 'Low → High' : 'A → Z'}
                        </button>
                        <button
                            onClick={() => setLocalSortOrder("DESC")}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                                localSortOrder === "DESC"
                                    ? 'bg-yellow-500 text-white border-yellow-500'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {localSortBy === 'productPrice' ? 'High → Low' : 'Z → A'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                    onClick={handleClear}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Clear All
                </button>
                <button
                    onClick={handleApply}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default ProductFilters;
