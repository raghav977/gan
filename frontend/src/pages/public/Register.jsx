
import React, { useState } from "react";
import {
  isEmpty,
  isValidPhone,
  minLength,
  valdateEmail,
} from "../../utils/validation";
import axios from "axios";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
console.log("Using BACKEND_URL:", BACKEND_URL);

export default function Register() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    contact: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccess("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError("");
    setSuccess("");


    if (
      isEmpty(formData.username) ||
      isEmpty(formData.email) ||
      isEmpty(formData.password) ||
      isEmpty(formData.contact)
    ) {
      setError("Please fill in all fields.");
      return;
    }


    if (!minLength(formData.username, 3)) {
      setError("Username must be at least 3 characters long.");
      return;
    }


    if (!valdateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }


    if (!isValidPhone(formData.contact)) {
      setError("Please enter a valid contact number.");
      return;
    }


    if (!minLength(formData.password, 6)) {
      setError("Password must be at least 6 characters long.");
      return;
    }


    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      contact: formData.contact,
    };

    try{
      const response = await axios.post(`${BACKEND_URL}/api/register`, payload);
      console.log("the response",response.data);
      setSuccess("Registration successful! You can now log in.");
    }
    catch(err){
      console.error("Registration error:", err.response.data.message);
      setError("Error: "+ err.response.data.message);
    }

  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Trainer Account
            </h1>
            <p className="text-slate-600">Join our fitness community as a trainer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="trainer_jane"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Contact Number
              </label>
              <input
                id="contact"
                name="contact"
                type="tel"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+1 555 555 5555"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            {success && <p className="text-emerald-600 text-sm mt-2">{success}</p>}

            <button
              type="submit"
              className="w-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 mt-6 shadow"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right - Hero Panel (matches home.jsx color pattern) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-blue-100">
              New trainers welcome
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Grow Your <span className="text-emerald-300">Training Business</span>
          </h2>

          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Connect with clients, manage schedules, and expand your impact.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-emerald-400/20 rounded-lg flex items-center justify-center mt-0.5">
                <svg
                  className="w-4 h-4 text-emerald-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-blue-50">Manage clients & schedules</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-emerald-400/20 rounded-lg flex items-center justify-center mt-0.5">
                <svg
                  className="w-4 h-4 text-emerald-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-blue-50">Attract more clients</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-emerald-400/20 rounded-lg flex items-center justify-center mt-0.5">
                <svg
                  className="w-4 h-4 text-emerald-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-blue-50">Build your reputation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
