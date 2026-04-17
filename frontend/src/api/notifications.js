import axios from "axios";

const API_URL = "http://localhost:5001/api/notifications";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const fetchNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const response = await axios.get(API_URL, {
    ...getAuthHeaders(),
    params: { page, limit }
  });
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await axios.patch(`${API_URL}/${notificationId}/read`, {}, getAuthHeaders());
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await axios.patch(`${API_URL}/read-all`, {}, getAuthHeaders());
  return response.data;
};
