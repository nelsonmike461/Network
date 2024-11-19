import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Card from "./Card";
import CommentModal from "./CommentModal";
import AuthContext from "../context/AuthProvider";
import axios from "axios";

function Details() {
  const { id } = useParams();
  const [tweet, setTweet] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const { authTokens, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTweetDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/tweet/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${authTokens?.access}`,
            },
          }
        );
        setTweet(response.data);
      } catch (error) {
        console.error("Error fetching tweet details:", error);
      }
    };

    if (id) {
      fetchTweetDetails();
    }
  }, [id, authTokens]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCommentSubmit = (success, newComment) => {
    if (success && newComment) {
      const updatedTweet = {
        ...tweet,
        comments: [newComment, ...tweet.comments],
        comments_count: tweet.comments_count + 1,
      };

      setTweet(updatedTweet);

      const commentAddedEvent = new CustomEvent("commentAdded", {
        detail: {
          tweetId: tweet.id,
          updatedTweet: updatedTweet,
        },
      });
      document.dispatchEvent(commentAddedEvent);
    }
    setIsCommentModalOpen(false);
  };

  if (!tweet) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Tweet Card */}
      <div className="sticky top-0 z-10 bg-white">
        <Card tweet={tweet} onTweetUpdate={setTweet} isDetailView={true} />
      </div>

      {/* Comments Section */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Sticky Comments Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-400">
          <div className="flex justify-between items-center px-4 py-3">
            <h2 className="text-l font-bold text-blue-800">
              Comments ({tweet.comments_count})
            </h2>
            {user && (
              <button
                onClick={() => setIsCommentModalOpen(true)}
                className="px-4 py-1 bg-blue-800 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
              >
                Add Comment
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Comments List */}
        <div className="flex-grow overflow-y-auto scrollbar-hide">
          {tweet.comments.length > 0 ? (
            <div>
              {tweet.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-400"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700 hover:underline cursor-pointer">
                        {comment.commenter}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDate(comment.commented)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-3">No comments yet.</p>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={handleCommentSubmit}
        tweetId={tweet.id}
      />
    </div>
  );
}

export default Details;
