import React, { useContext, useState } from "react";
import { FaRegComment, FaRegHeart, FaHeart } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import profileImage from "../assets/Profile.png";
import AuthContext from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import TweetModal from "./TweetModal";
import CommentModal from "./CommentModal";
import axios from "axios";

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
          likes_count: response.data.liked
            ? tweet.likes_count + 1
            : tweet.likes_count - 1,
          is_liked: response.data.liked,
          comments_count: tweet.comments_count,
          comments: tweet.comments,
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
      onTweetUpdate(updatedTweet);
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
          is_liked: tweet.is_liked,
          likes_count: tweet.likes_count,
        };
        onTweetUpdate(updatedTweet);

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
