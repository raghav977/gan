import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { requestEnrollment, checkEnrollmentStatus } from "../api/clientTrainer.api";

export default function TrainerCard({ trainer, onChat }) {
  const { user } = useSelector((state) => state.user);
  console.log("This is userrrr",user);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && trainer.userId) {
      console.log("This is user",user);
      checkStatus();
    }
  }, [user, trainer.userId]);

  const checkStatus = async () => {
    try {
      const res = await checkEnrollmentStatus(trainer.userId);
      setEnrollmentStatus(res.data?.status || null);
    } catch (err) {
      console.error("Error checking enrollment:", err);
    }
  };

  const handleEnrollRequest = async () => {
    if (!user) {
      alert("Please login to become an online student");
      return;
    }
    
    setLoading(true);
    try {
      await requestEnrollment(trainer.userId);
      setEnrollmentStatus("pending");
      alert("Request sent successfully! Wait for trainer to accept.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const getEnrollButton = () => {
    if (enrollmentStatus === "accepted") {
      return (
        <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
          Online Student ✓
        </span>
      );
    }
    if (enrollmentStatus === "pending") {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
          Request Pending
        </span>
      );
    }
    return (
      <button
        onClick={handleEnrollRequest}
        disabled={loading}
        className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-full hover:bg-yellow-600 disabled:opacity-50"
      >
        {loading ? "..." : "Become Student"}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col">
      <div className="flex items-center gap-4">
        <img
          src={trainer.avatar}
          alt={trainer.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="font-semibold text-slate-900">{trainer.name}</div>
          <div className="text-xs text-slate-400">{trainer.specialty}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">{trainer.location}</div>

        <div className="flex gap-2">
          {user?.role === "user" && getEnrollButton()}
          <button
            onClick={onChat}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700"
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}