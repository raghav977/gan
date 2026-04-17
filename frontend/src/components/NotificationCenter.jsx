import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBell, FaCheckDouble } from "react-icons/fa";
import { TbMassage, TbListCheck, TbShoppingBag } from "react-icons/tb";
import {
  loadNotifications,
  markEveryNotificationRead,
  markSingleNotificationRead,
  resetNotificationsState,
  selectLastNotification,
  selectNotificationLoading,
  selectNotifications,
  selectUnreadCount
} from "../store/slices/notificationsSlice";
import { selectIsAuthenticated } from "../store/slices/authSlice";

const typeIconMap = {
  MESSAGE: TbMassage,
  TODO: TbListCheck,
  PRODUCT: TbShoppingBag,
  GENERAL: FaBell
};

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationLoading);
  const lastNotification = useSelector(selectLastNotification);

  const [isOpen, setIsOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadNotifications());
    } else {
      dispatch(resetNotificationsState());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!hydrated || !lastNotification) return;
    setToastNotification(lastNotification);
    const timeout = setTimeout(() => setToastNotification(null), 5000);
    return () => clearTimeout(timeout);
  }, [hydrated, lastNotification]);

  const formattedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        createdLabel: new Date(notification.createdAt).toLocaleString()
      })),
    [notifications]
  );

  if (!isAuthenticated) return null;

  const handleMarkAll = () => {
    if (unreadCount > 0) {
      dispatch(markEveryNotificationRead());
    }
  };

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markSingleNotificationRead(notification.id));
    }
  };

  return (
  <div className="fixed top-0 right-0 z-50 flex flex-col items-end gap-3">
      {toastNotification && (
  <div className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-lg max-w-xs">
          <p className="text-xs uppercase text-yellow-300 tracking-wide">
            {toastNotification.title}
          </p>
          <p className="text-sm mt-1">{toastNotification.body}</p>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex items-center gap-2 rounded-full bg-white shadow-lg px-4 py-2 border border-gray-100 hover:shadow-xl transition"
        >
          <FaBell className="text-yellow-500" />
          <span className="text-sm font-semibold"></span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-gray-500">Stay updated in real time</p>
              </div>
              <button
                onClick={handleMarkAll}
                disabled={unreadCount === 0}
                className="text-xs flex items-center gap-1 text-yellow-600 disabled:opacity-40"
              >
                <FaCheckDouble /> Mark all
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {loading && (
                <div className="p-6 text-sm text-gray-500 text-center">Loading...</div>
              )}

              {!loading && formattedNotifications.length === 0 && (
                <div className="p-6 text-sm text-gray-500 text-center">No notifications yet.</div>
              )}

              {!loading && formattedNotifications.map((notification) => {
                const Icon = typeIconMap[notification.type] || FaBell;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleItemClick(notification)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition ${
                      notification.isRead ? "bg-white" : "bg-yellow-50"
                    }`}
                  >
                    <span
                      className={`mt-1 p-2 rounded-full ${
                        notification.type === "PRODUCT"
                          ? "bg-green-100 text-green-600"
                          : notification.type === "TODO"
                          ? "bg-blue-100 text-blue-600"
                          : notification.type === "MESSAGE"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {notification.createdLabel}
                      </p>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
