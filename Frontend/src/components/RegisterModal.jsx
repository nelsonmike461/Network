import React, { useState } from "react";
import ReactModal from "react-modal";
import { BsGlobe } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";

function RegisterModal({ isOpen, onClose, onRegister }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await onRegister(e);

    if (response && response.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError(null);
    onClose();
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleModalClose}
      shouldCloseOnOverlayClick={true}
      contentLabel="Register Modal"
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-20"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} aria-label="Register Form">
          <fieldset>
            <span className="flex items-center justify-center gap-2 text-blue-900 mb-3">
              <BsGlobe size={35} />
              <legend className="font-semibold text-2xl">Register</legend>
            </span>
            <div className="mb-2">
              <label htmlFor="username" className="text-blue-900">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                onChange={() => setError(null)}
                className="w-full p-2 border-2 border-gray-300 rounded focus:border-blue-900 focus:outline-none focus:border-2"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="password" className="text-blue-900">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={() => setError(null)}
                className="w-full p-2 border-2 border-gray-300 rounded focus:border-blue-900 focus:outline-none focus:border-2"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="confirmation" className="text-blue-900">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmation"
                placeholder="Confirm Password"
                required
                onChange={() => setError(null)}
                className="w-full p-2 border-2 border-gray-300 rounded focus:border-blue-900 focus:outline-none focus:border-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white p-2 mt-4 rounded flex justify-center items-center"
              style={{ height: "2.5rem" }}
            >
              {loading ? (
                <ImSpinner8 className="animate-spin" size={24} />
              ) : (
                "Register"
              )}
            </button>
            <div
              onClick={handleModalClose}
              className="cursor-pointer text-center text-black hover:text-red-900 mt-2"
            >
              Cancel
            </div>
          </fieldset>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </form>
      </div>
    </ReactModal>
  );
}

export default RegisterModal;
