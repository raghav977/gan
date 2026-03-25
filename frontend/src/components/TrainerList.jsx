import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ChatModal from "./chat/ChatModal";
import PleaseLogin from "./PleaseLogin";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import { requestEnrollment, checkEnrollmentStatus } from "../api/clientTrainer.api";

const TrainerList = ({ trainers, loading, error }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state) => state.auth?.user);

  const [chatModal, setChatModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
  const [enrollLoading, setEnrollLoading] = useState({});

  const handleTrainerClick = (trainerId) => {
    navigate(`/trainers/${trainerId}`);
  };

  const handleChatModal = (trainer, e) => {
    e?.stopPropagation();
    
    if (!isAuthenticated) {
      setSelectedTrainer(null);
      setChatModal(true);
      return;
    }
    
    // Pass trainer with userId for socket connection
    setSelectedTrainer({
      userId: trainer.userId,
      username: trainer.username,
      email: trainer.email,
      specialization: trainer.specialization
    });
    setChatModal(true);
  };

  const handleClose = () => {
    setChatModal(false);
    setSelectedTrainer(null);
  };

  const handleEnrollRequest = async (trainerId, e) => {
    e?.stopPropagation();
    
    if (!isAuthenticated) {
      alert("Please login to become an online student");
      return;
    }
    
    setEnrollLoading(prev => ({ ...prev, [trainerId]: true }));
    try {
      await requestEnrollment(trainerId);
      setEnrollmentStatuses(prev => ({ ...prev, [trainerId]: "pending" }));
      alert("Request sent successfully! Wait for trainer to accept.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    } finally {
      setEnrollLoading(prev => ({ ...prev, [trainerId]: false }));
    }
  };

  const getEnrollButton = (trainer) => {
    const status = enrollmentStatuses[trainer.userId];
    const isLoading = enrollLoading[trainer.userId];
    
    if (status === "accepted") {
      return (
        <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
          Online Student ✓
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">
          Request Pending
        </span>
      );
    }
    return (
      <button
        onClick={(e) => handleEnrollRequest(trainer.userId, e)}
        disabled={isLoading}
        className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 disabled:opacity-50"
      >
        {isLoading ? "..." : "Become Student"}
      </button>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Trainers</h2>
          <p className="text-gray-600">
            Professional trainers ready to guide your fitness journey
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-500">Loading trainers...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-8 text-red-500">{error}</div>
        )}

        {/* Trainer Grid */}
        {!loading && !error && (
          <>
            {trainers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No trainers available
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    onClick={() => handleTrainerClick(trainer.id)}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                  >

                    {/* Avatar */}
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <div className="w-20 h-20 bg-yellow-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                        {trainer.username?.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Trainer Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold mb-1">
                        {trainer.username}
                      </h3>

                      <p className="text-gray-500 text-sm mb-3">
                        {trainer.email}
                      </p>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {trainer.specialization || "No specialization provided"}
                      </p>

                      <div className="flex justify-between items-center text-sm">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                          {trainer.type}
                        </span>

                        <button className="text-gray-500 border rounded-lg px-4 py-2 cursor-pointer bg-yellow-300 hover:bg-white hover:text-black duration-75" onClick={(e) => handleChatModal(trainer, e)}>
                          Chat 
                        </button> 
                      </div>

                      {/* Become Student Button */}
                      {user?.role === "user" && (
                        <div className="mt-3">
                          {getEnrollButton(trainer)}

                        </div>
                      )}

                      {/* Status */}
                      <div className="mt-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            trainer.is_verified
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {trainer.is_verified ? "Verified Trainer" : "Pending"}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}


        {chatModal && (
          isAuthenticated ? (
            <ChatModal trainer={selectedTrainer} onClose={handleClose} />
          ) : (
            <PleaseLogin message="Please login to chat with trainers" />
          )
        )}

      </div>
    </section>
  );
};

export default TrainerList;