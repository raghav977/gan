import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logout());
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 800);

    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 text-center space-y-3">
        <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto" />
        <h1 className="text-xl font-semibold">Signing you out...</h1>
        <p className="text-gray-500 text-sm">Your session is cleared and you'll be redirected shortly.</p>
      </div>
    </div>
  );
};

export default Logout;
