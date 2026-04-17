import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../../api/notifications";

export const loadNotifications = createAsyncThunk(
  "notifications/load",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchNotifications();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const markSingleNotificationRead = createAsyncThunk(
  "notifications/markSingle",
  async (notificationId, { rejectWithValue }) => {
    try {
  const response = await markNotificationRead(notificationId);
  return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update notification");
    }
  }
);

export const markEveryNotificationRead = createAsyncThunk(
  "notifications/markAll",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update notifications");
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  unread: 0,
  lastNotification: null
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.items = [action.payload, ...state.items].slice(0, 50);
      state.unread += 1;
      state.lastNotification = action.payload;
    },
    resetNotificationsState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.unread = state.items.filter((item) => !item.isRead).length;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markSingleNotificationRead.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item
        );
        state.unread = state.items.filter((item) => !item.isRead).length;
      })
      .addCase(markEveryNotificationRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, isRead: true }));
        state.unread = 0;
      });
  }
});

export const { addNotification, resetNotificationsState } = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unread;
export const selectNotificationLoading = (state) => state.notifications.loading;
export const selectLastNotification = (state) => state.notifications.lastNotification;

export default notificationsSlice.reducer;
