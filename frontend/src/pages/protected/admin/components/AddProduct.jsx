import React, { useState } from "react";

const AddProduct = ({ onClose, onSubmit, loading = false, initialData = {}, isEdit = false }) => {
  const [form, setForm] = useState({
    productName: initialData.productName || "",
    price: initialData.price || "",
    description: initialData.description || "",
    stock: initialData.stock || 0,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (files) {
      setForm({ ...form, [id]: files[0] });
      // Create preview URL
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} 
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Product" : "Add Product"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              id="productName"
              value={form.productName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input
              type="number"
              id="price"
              value={form.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input
              type="number"
              id="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
              rows="3"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Image {isEdit && "(Leave empty to keep current)"}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
