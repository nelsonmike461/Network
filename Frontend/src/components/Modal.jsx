import React from "react";
import ReactModal from "react-modal";
import { FaArrowLeftLong } from "react-icons/fa6";

function Modal({ isOpen, onClose, children }) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      className="bg-white p-4 rounded-md shadow-md w-1/2 max-h-screen overflow-y-scroll scrollbar-hide"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      contentLabel="tweets Modal"
    >
      <button
        className="text-blue-500 mb-2"
        onClick={onClose}
        aria-label="Close modal"
      >
        <FaArrowLeftLong />
      </button>
      {children}
    </ReactModal>
  );
}

export default Modal;
