import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import profileImage from "../assets/Profile.png";
import AuthContext from "../context/AuthProvider";
import Card from "../components/Card";
import axios from "axios";

function Profile() {
  const { username } = useParams();
  const { user, authTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tweets");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetUsername = username || user.username;
        const response = await axios.get(
          `http://127.0.0.1:8000/api/profile/${targetUsername}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authTokens?.access}`,
            },
          }
        );
        setProfileData(response.data);
        setIsFollowing(response.data.user.is_following || false);
        setLoading(false);
      } catch (error) {
        setError(
          error.response?.status === 404
            ? "Profile not found"
            : "Failed to fetch profile data"
        );
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, user]);

  const handleFollowToggle = async () => {
    setIsFollowLoading(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/profile/${profileData.user.username}/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokens?.access}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsFollowing(!isFollowing);
        setProfileData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            followers_count: isFollowing
              ? prev.user.followers_count - 1
              : prev.user.followers_count + 1,
          },
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleTweetUpdate = (updatedTweet) => {
    setProfileData((prevData) => ({
      ...prevData,
      tweets: prevData.tweets.map((tweet) =>
        tweet.id === updatedTweet.id ? updatedTweet : tweet
      ),
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderEmptyMessage = (type) => (
    <p className="text-gray-500 text-center py-4">No {type} yet</p>
  );

  const renderTweets = (tweets) =>
    tweets?.length > 0
      ? tweets.map((tweet) => (
          <Card
            key={tweet.id}
            tweet={tweet}
            onTweetUpdate={handleTweetUpdate}
          />
        ))
      : renderEmptyMessage("tweets");

  const TabContent = {
    tweets: () => renderTweets(profileData.tweets),
    likes: () => renderTweets(profileData.liked_tweets),
    comments: () => (
      <div>
        {profileData.comments?.length > 0
          ? profileData.comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-400 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/tweet/${comment.main_post}`)}
              >
                <div className="flex flex-col">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-bold text-blue-700">
                      {comment.commenter}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(comment.commented)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.comment}</p>
                </div>
              </div>
            ))
          : renderEmptyMessage("comments")}
      </div>
    ),
  };

  const renderTab = (tabName, label) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-6 py-3 text-sm font-medium ${
        activeTab === tabName
          ? "border-b-2 border-blue-500 text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );

  if (!authTokens?.access) return null;
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  const renderError = (message) => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="p-4 text-red-500 text-center">{message}</div>
      <button
        onClick={() => navigate("/")}
        className="mt-4 text-blue-600 hover:text-blue-800"
      >
        Return to Home
      </button>
    </div>
  );

  if (error) return renderError(error);
  if (!profileData) return renderError("No profile data found");

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Fixed Header Section */}
        <div className="sticky top-0 bg-white z-10">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-6">
              <img
                src={profileImage}
                alt="profile"
                className="w-24 h-24 rounded-full border-2 border-blue-700 bg-blue-700"
              />
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-bold text-gray-900">
                    {profileData.user.username}
                  </span>
                  {!profileData.user.is_self_profile && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={`
                        px-8 py-1 rounded-full text-sm font-semibold 
                        transition-all duration-200 relative w-[120px] flex items-center justify-center
                        ${isFollowLoading ? "cursor-not-allowed" : ""}
                        ${
                          isFollowing
                            ? "bg-blue-200 text-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-600 border group"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }
                      `}
                    >
                      {isFollowLoading ? (
                        <div className="h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin mx-auto" />
                      ) : isFollowing ? (
                        <div className="w-[80px]">
                          <span className="block group-hover:hidden">
                            Following
                          </span>
                          <span className="hidden group-hover:block">
                            Unfollow
                          </span>
                        </div>
                      ) : (
                        <span className="block w-[80px]">Follow</span>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex space-x-6 text-gray-600">
                  {["following", "followers"].map((type) => (
                    <span key={type} className="flex flex-col">
                      <span className="font-semibold capitalize">{type}</span>
                      <span className="text-center">
                        {profileData.user[`${type}_count`]}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex justify-center">
              {renderTab("tweets", "Tweets")}
              {renderTab("likes", "Likes")}
              {renderTab("comments", "Comments")}
            </nav>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="overflow-y-scroll scrollbar-hide">
          {TabContent[activeTab]()}
        </div>
      </div>
    </div>
  );
}

export default Profile;
