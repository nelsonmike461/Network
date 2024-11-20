// Card.jsx
import React, { useContext, useState } from "react";
import { FaRegComment, FaRegHeart, FaHeart } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import profileImage from "../assets/Profile.png";
import AuthContext from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import TweetModal from "./TweetModal";
import CommentModal from "./CommentModal";
import axios from "axios";
import LoginModal from "../components/LoginModal";

function Card({
  tweet,
  setLoginModalOpen,
  onTweetUpdate,
  isDetailView = false,
}) {
  const { user, authTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleAuthenticatedAction = (action, e) => {
    e.stopPropagation();
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    action(e);
  };

  const handleUsernameClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleTweetClick = () => {
    navigate(`/tweet/${tweet.id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/tweet/like-unlike/${tweet.id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
          },
        }
      );

      if (response.data.success) {
        const updatedTweet = {
          ...tweet,
          is_liked: response.data.liked,
          likes_count: response.data.liked
            ? tweet.likes_count + 1
            : tweet.likes_count - 1,
        };

        onTweetUpdate(updatedTweet);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    setIsCommentModalOpen(true);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = (wasSuccessful, updatedTweet) => {
    setIsEditModalOpen(false);
    if (wasSuccessful && updatedTweet) {
      // Preserve the like state and comments when updating
      const mergedTweet = {
        ...updatedTweet,
        is_liked: tweet.is_liked,
        likes_count: tweet.likes_count,
        comments_count: tweet.comments_count,
        comments: tweet.comments,
      };
      onTweetUpdate(mergedTweet);
    }
  };

  const handleCommentModalClose = (wasSuccessful, newComment) => {
    setIsCommentModalOpen(false);
    try {
      if (wasSuccessful && newComment) {
        const updatedTweet = {
          ...tweet,
          comments_count: tweet.comments_count + 1,
          comments: tweet.comments
            ? [newComment, ...tweet.comments]
            : [newComment],
          // Preserve like state
          is_liked: tweet.is_liked,
          likes_count: tweet.likes_count,
        };
        onTweetUpdate(updatedTweet);

        // Dispatch event for other components
        const commentAddedEvent = new CustomEvent("commentAdded", {
          detail: {
            tweetId: tweet.id,
            updatedTweet: updatedTweet,
          },
        });
        document.dispatchEvent(commentAddedEvent);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const renderActionButton = ({
    onClick,
    icon: Icon,
    count,
    hoverColor,
    additionalClasses = "",
  }) => (
    <button
      onClick={(e) => handleAuthenticatedAction(onClick, e)}
      className={`flex items-center space-x-1 text-xs 
        transition-colors group ${additionalClasses}`}
    >
      <Icon
        className={`mr-1 transform transition-all duration-200 
          ${
            hoverColor === "red"
              ? "group-hover:text-red-500"
              : "group-hover:text-blue-500"
          }
          group-hover:scale-110 active:scale-90`}
      />
      <span
        className={`${
          hoverColor === "red"
            ? "group-hover:text-red-500"
            : "group-hover:text-blue-500"
        }`}
      >
        {count}
      </span>
    </button>
  );

  return (
    <>
      <div
        className="border-b border-gray-400 p-4 flex hover:bg-gray-50 transition-colors"
        onClick={handleTweetClick}
      >
        <img
          src={profileImage}
          alt="dummy profile image"
          className="w-14 h-14 rounded-full border-2 border-blue-700 bg-blue-700 mr-4"
        />
        <div className="flex-grow">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                onClick={(e) =>
                  handleAuthenticatedAction(
                    () => handleUsernameClick(tweet.poster),
                    e
                  )
                }
                className="font-bold text-blue-700 hover:underline cursor-pointer"
              >
                {tweet.poster}
              </span>
              {tweet.edited && (
                <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                  edited
                </span>
              )}
            </div>
            <span className="text-gray-500 text-sm">
              {formatDate(tweet.date_posted)}
            </span>
          </div>

          <p className="mb-4 text-gray-700 text-sm">{tweet.tweet}</p>

          <div className="flex items-center w-full">
            <div className="flex items-center space-x-16">
              {renderActionButton({
                onClick: handleLike,
                icon: tweet.is_liked ? FaHeart : FaRegHeart,
                count: tweet.likes_count,
                hoverColor: "red",
                additionalClasses: tweet.is_liked ? "text-red-500" : "",
              })}
              {renderActionButton({
                onClick: handleComment,
                icon: FaRegComment,
                count: tweet.comments_count,
                hoverColor: "blue",
              })}
            </div>

            {user && user.username === tweet.poster && (
              <button
                onClick={(e) => handleAuthenticatedAction(handleEdit, e)}
                className="text-blue-500 hover:text-blue-600 transition-colors ml-auto"
                title="Edit tweet"
              >
                <span className="flex items-center gap-1 pl-2 pr-2 bg-blue-100 border border-blue-900 rounded-full text-sm">
                  <MdEdit size={14} /> Edit
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <TweetModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        tweet={tweet}
      />
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={handleCommentModalClose}
        tweetId={tweet.id}
      />
    </>
  );
}

export default Card;

// LoginModal
import React, { useContext, useState } from "react";
import ReactModal from "react-modal";
import { BsGlobe } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";
import AuthContext from "../context/AuthProvider";

function LoginModal({ isOpen, onClose }) {
  const { loginUser } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await loginUser(e);

    if (response && response.error) {
      setError(response.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
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
      contentLabel="Login Modal"
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-20"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} aria-label="Login Form">
          <fieldset>
            <span className="flex items-center justify-center gap-2 text-blue-900 mb-3">
              <BsGlobe size={35} />
              <legend className="font-semibold text-2xl">Login</legend>
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
            <div className>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white p-2 mt-4 rounded flex justify-center items-center"
              style={{ height: "2.5rem" }}
            >
              {loading ? (
                <ImSpinner8 className="animate-spin" size={24} />
              ) : (
                "Login"
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

export default LoginModal;
