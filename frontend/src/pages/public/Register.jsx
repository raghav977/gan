import React, { useState } from "react";
import {
  isEmpty,
  isValidPhone,
  minLength,
  valdateEmail,
} from "../../utils/validation";
import { sendOTP, verifyOTP, completeUserRegistration } from "../../api/otp.api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    contact: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccess("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startOTPTimer = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isEmpty(email)) {
      setError("Please enter email address.");
      return;
    }

    if (!valdateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await sendOTP(email, 'user');
      setStep('otp');
      setSuccess("OTP sent to your email! Check your inbox.");
      startOTPTimer();
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isEmpty(otp)) {
      setError("Please enter OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      await verifyOTP(email, otp);
      setStep('details');
      setSuccess("Email verified! Now complete your details.");
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register with details
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isEmpty(formData.username) || isEmpty(formData.password) || isEmpty(formData.contact)) {
      setError("Please fill in all fields.");
      return;
    }

    if (!minLength(formData.username, 3)) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    if (!minLength(formData.password, 6)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!isValidPhone(formData.contact)) {
      setError("Please enter a valid contact number.");
      return;
    }

    try {
      setLoading(true);
      await completeUserRegistration(email, otp, formData.username, formData.password, formData.contact);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-linear-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl mb-4 shadow-md">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Register</h2>
            <p className="text-gray-500 text-sm mt-2">
              {step === 'email' ? 'Verify your email' : step === 'otp' ? 'Enter OTP' : 'Complete your profile'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 font-semibold hover:underline">
                  Login
                </a>
              </p>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">
                  We sent an OTP to <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in <span className="font-semibold">{otpTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="text-sm text-blue-500 font-semibold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp("");
                  setOtpTimer(0);
                }}
                className="w-full text-gray-600 py-2 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">
                  Email verified: <span className="font-semibold text-green-600">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setFormData({ username: "", password: "", contact: "" });
                }}
                className="w-full text-gray-600 py-2 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="hidden md:flex w-1/2 bg-linear-to-br from-blue-500 to-indigo-600 items-center justify-center p-12">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Join Tute Kendra Hub</h1>
          <p className="text-lg text-blue-100">
            Learn from certified trainers and transform your fitness journey
          </p>
        </div>
      </div>
    </div>
  );
}
