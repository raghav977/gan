import { useTrainerForm } from "../../hooks/UseTrainerForm"
import { useGeoLocation } from "../../hooks/UseGeoLocation"
import TrainerMap from "../../components/TrainerMap"
import { useState } from "react"
import { useNavigate } from "react-router";
import { sendOTP, verifyOTP, completeTrainerRegistration } from "../../api/otp.api";
import { isEmpty, isValidPhone, minLength, valdateEmail } from "../../utils/validation";

export default function RegisterTrainer() {
  const { formData, updateField } = useTrainerForm()
  const { location, error: locationError } = useGeoLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [files, setFiles] = useState([])
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'details'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
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

  // Step 1: Send OTP
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
      await sendOTP(email, 'trainer');
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
      setSuccess("Email verified! Now complete your trainer details.");
      setEmail(email);
      updateField("email", email);
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register trainer
  const handleRegisterTrainer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.password || !formData.contact) {
      setError("Username, password and contact are required.");
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

    if (!location) {
      setError("Location is required.");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("email", email);
      payload.append("otpCode", otp);
      payload.append("password", formData.password);
      payload.append("username", formData.username);
      payload.append("contact", formData.contact);
      payload.append("specialization", formData.specialization);
      payload.append("type", formData.type);
      payload.append("latitude", location.lat);
      payload.append("longitude", location.lng);
      payload.append("radius", formData.radiusKm);

      files.forEach((file) => {
        payload.append("certificate", file);
      });

      await completeTrainerRegistration(email, otp, payload);
      setSuccess("Trainer registered successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to register trainer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* FORM */}
        <form onSubmit={step === 'email' ? handleSendOTP : step === 'otp' ? handleVerifyOTP : handleRegisterTrainer} className="p-8 space-y-5">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 'email' ? 'Trainer Registration - Email' : step === 'otp' ? 'Verify Email' : 'Complete Your Profile'}
          </h2>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {step === 'email' ? (
            <>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : step === 'otp' ? (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">
                  We sent an OTP to <span className="font-semibold">{email}</span>
                </p>
              </div>

              <Input
                label="Enter OTP"
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError("");
                }}
                placeholder="000000"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
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
                className="w-full text-gray-600 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">
                  Email verified: <span className="font-semibold text-green-600">{email}</span>
                </p>
              </div>

              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => updateField("username", e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
              />

              <Input
                label="Contact Number"
                value={formData.contact}
                onChange={(e) => updateField("contact", e.target.value)}
              />

              <Input
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => updateField("specialization", e.target.value)}
              />

              <Select
                label="Trainer Type"
                value={formData.type}
                onChange={(e) => updateField("type", e.target.value)}
                options={[
                  { label: "Select type", value: "" },
                  { label: "Personal Trainer", value: "personal" },
                  { label: "Nutritionist", value: "nutrition" },
                  { label: "Physiotherapist", value: "physio" },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Service Radius: {formData.radiusKm} km
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={formData.radiusKm}
                  onChange={(e) => updateField("radiusKm", e.target.value)}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documents (max 5)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              {location && (
                <p className="text-sm text-green-600">
                  Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}

              {locationError && (
                <p className="text-sm text-red-600">{locationError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setOtp("");
                  updateField("username", "");
                  updateField("password", "");
                  updateField("contact", "");
                }}
                className="w-full text-gray-600 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
            </>
          )}
        </form>

        {/* MAP - Only show on details step and on desktop */}
        {step === 'details' && (
          <div className="h-100 lg:h-full">
            <TrainerMap location={location} radiusKm={formData.radiusKm} />
          </div>
        )}
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  )
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
