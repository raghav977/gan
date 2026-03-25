import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {loginUser} from "../../api/user"
import { useNavigate } from "react-router-dom";
import { loginSuccess, loginFailure } from "../../store/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [error,setError] = useState(null);
  const [message,setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log("Login data:", form);

    try{
      const response = await loginUser(form.email,form.password);

      console.log("This is response",response);
      setMessage(response.message);
      
      // Dispatch login success to Redux
      dispatch(loginSuccess({
        token: response.token,
        user: response.user
      }));
      
      console.log("This is response,use",response.user);
      if(response.user.role=='user'){
        console.log("Here??");
        navigate("/");
      }
      else if(response.user.role=='trainer'){
        navigate("/trainer");
      }
      else if(response.user.role=='admin')
        navigate("/admin");
      else{
        return;
      }
    }
    catch(err){
      console.log("Something went wrong",err.message);
      setError(err.message);
      dispatch(loginFailure(err.message));
    }

  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
