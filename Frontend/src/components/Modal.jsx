import React, { useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const Modal = ({ show, onClose, children }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  if (!show) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-4 rounded-md shadow-md w-1/2 max-h-screen overflow-y-scroll scrollbar-hide">
        <button className="text-blue-500 mb-2" onClick={onClose}>
          <FaArrowLeftLong />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
