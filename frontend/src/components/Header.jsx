import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { MdMessage } from "react-icons/md";
import { selectIsAuthenticated, selectUser, logout } from "../store/slices/authSlice";
import { selectUnreadCount } from "../store/slices/chatSlice";
import { disconnectSocket } from "../services/socket.service";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const unreadCount = useSelector(selectUnreadCount);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate("/");
  };

  const navBarItems = [
    { name: "Home", link: "/" },
    { name: "Courses", link: "/courses" },
    { name: "Product", link: "/product" },
    { name: "About Us", link: "/about" },
  ];

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">

        {/* LEFT — NAV LINKS */}
        <nav>
          <ul className="flex gap-10 items-center">
            {navBarItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.link}
                  className="text-gray-700 font-medium hover:text-[#F7C707] transition-colors duration-200"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CENTER — LOGO */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-wide text-gray-900">
            GYM <span className="text-[#F7C707]">FITNESS</span>
          </h2>
        </div>

        {/* RIGHT — AUTH BUTTONS */}
        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <>
              {/* Messages Link */}
              {user?.role === 'user' && (
                <Link
                  to="/user/messages"
                  className="relative p-2 text-gray-600 hover:text-yellow-500 transition-colors"
                  title="Messages"
                >
                  <MdMessage size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              {user?.role === 'trainer' && (
                <Link
                  to="/trainer/messages"
                  className="relative p-2 text-gray-600 hover:text-yellow-500 transition-colors"
                  title="Messages"
                >
                  <MdMessage size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="bg-[#F7C707] text-gray-900 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-400 transition-all duration-200"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/register")}
                className="bg-[#F7C707] text-gray-900 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-400 transition-all duration-200"
              >
                Sign Up
              </button>

              <button
                onClick={() => navigate("/login")}
                className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg border border-gray-300 shadow-md hover:bg-gray-100 transition-all duration-200"
              >
                Sign In
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
