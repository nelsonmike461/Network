import React, { useState, useContext } from "react";
import { ImSpinner8 } from "react-icons/im";
import AuthContext from "../context/AuthProvider";
import axios from "axios";
import ReactModal from "react-modal";

function TweetModal({ isOpen, onClose, tweet = null }) {
  const isEditing = !!tweet;
  const [tweetContent, setTweetContent] = useState(tweet?.tweet || "");
  const { authTokens } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleModalClose = () => {
    setError(null);
    setTweetContent(tweet?.tweet || "");
    onClose(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError("");

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authTokens?.access}`,
        },
      };

      const url = isEditing
        ? `http://127.0.0.1:8000/api/tweet/${tweet.id}/`
        : "http://127.0.0.1:8000/api/tweet/";

      const method = isEditing ? axios.put : axios.post;

      const response = await method(url, { tweet: tweetContent }, config);

      if (response.status === (isEditing ? 200 : 201)) {
        if (!isEditing) setTweetContent("");
        onClose(true, response.data);
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          `Failed to ${isEditing ? "update" : "create"} tweet`
      );
    } finally {
      setLoading(false);
    }
  };

  const preventPropagation = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleModalClose}
      shouldCloseOnOverlayClick={true}
      className="bg-white p-4 rounded-md shadow-md w-1/2 max-h-screen overflow-y-scroll scrollbar-hide"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      contentLabel={`${isEditing ? "Edit" : "Create"} Post Modal`}
      onClick={preventPropagation}
      shouldCloseOnEsc={true}
    >
      <div className="p-4" onClick={preventPropagation}>
        <form
          onSubmit={handleSubmit}
          onClick={preventPropagation}
          aria-label={`${isEditing ? "Edit" : "Create"} Post Form`}
        >
          <fieldset>
            <legend className="font-semibold text-2xl text-blue-900 mb-4">
              {isEditing ? "Edit Tweet" : "New Post"}
            </legend>
            <div className="mb-4">
              <textarea
                value={tweetContent}
                onChange={(e) => {
                  e.stopPropagation();
                  setTweetContent(e.target.value);
                }}
                onClick={preventPropagation}
                onKeyDown={preventPropagation}
                onKeyUp={preventPropagation}
                className="w-full p-2 border-2 border-gray-300 rounded focus:border-blue-900 focus:outline-none focus:border-2"
                rows="4"
                placeholder="What's happening?"
                maxLength="280"
                required
              />
              <div className="text-sm text-gray-500 text-right mt-1">
                {280 - tweetContent.length} characters remaining
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || tweetContent.trim().length === 0}
              className="w-full bg-blue-900 text-white p-2 rounded flex justify-center items-center"
              style={{ height: "2.5rem" }}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              {loading ? (
                <ImSpinner8 className="animate-spin" size={24} />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Tweet"
              )}
            </button>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleModalClose();
              }}
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

export default TweetModal;
