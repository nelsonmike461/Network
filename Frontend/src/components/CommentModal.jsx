import React, { useState, useContext } from "react";
import { ImSpinner8 } from "react-icons/im";
import AuthContext from "../context/AuthProvider";
import axios from "axios";
import ReactModal from "react-modal";

function CommentModal({ isOpen, onClose, tweetId }) {
  const [comment, setComment] = useState("");
  const { authTokens } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/tweet/comment/${tweetId}/`,
        {
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
          },
        }
      );

      onClose(true, response.data);
      setComment("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setComment("");
    setError("");
    onClose(false);
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleModalClose}
      shouldCloseOnOverlayClick={true}
      className="bg-white p-4 rounded-md shadow-md w-1/2 max-h-screen overflow-y-scroll scrollbar-hide"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      contentLabel="Add Comment Modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend className="font-semibold text-2xl text-blue-900 mb-4">
              Add Comment
            </legend>
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border-2 border-gray-300 rounded focus:border-blue-900 focus:outline-none focus:border-2"
                rows="4"
                placeholder="Write your comment..."
                maxLength="280"
                required
              />
              <div className="text-sm text-gray-500 text-right mt-1">
                {280 - comment.length} characters remaining
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || comment.trim().length === 0}
              className="w-full bg-blue-900 text-white p-2 rounded flex justify-center items-center"
              style={{ height: "2.5rem" }}
            >
              {loading ? (
                <ImSpinner8 className="animate-spin" size={24} />
              ) : (
                "Add Comment"
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

export default CommentModal;
