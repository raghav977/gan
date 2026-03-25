import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PleaseLogin = ({ message = "Please Login" }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  if (!isOpen) return null; // Don't render if closed

  const handleClose = () => setIsOpen(false);

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/login'); // Redirect to login page
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      
      {/* Modal Box */}
      <div className="bg-white rounded-xl shadow-lg w-80 p-6 flex flex-col gap-4 animate-fadeIn">
        
        {/* Message */}
        <p className="text-center text-gray-700 font-medium">{message}</p>
        
        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default PleaseLogin;