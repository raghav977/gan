import axios from "axios";

const API_URL = "http://localhost:5001/api/user/products";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const addProductToCart = async (productId, quantity = 1) => {
  try {
    const response = await axios.post(
      `${API_URL}/cart/add/${productId}`,
      { quantity },
      getAuthHeaders()
    );
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to add product to cart";
    throw new Error(message);
  }
};

export const getUserProductsByStatus = async ({ status = "PENDING", page = 1, limit = 20 } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      ...getAuthHeaders(),
      params: { status, page, limit }
    });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to fetch products";
    throw new Error(message);
  }
};

export const removeCartItem = async (cartItemId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/cart/remove/${cartItemId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to remove cart item";
    throw new Error(message);
  }
};

export const purchaseCartItems = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/cart/purchase`,
      {},
      getAuthHeaders()
    );
    return response.data?.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to initiate payment";
    throw new Error(message);
  }
};

export const verifyProductPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/verify-purchase`,
      { paymentData },
      getAuthHeaders()
    );
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to verify payment";
    throw new Error(message);
  }
};
