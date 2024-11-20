import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import Card from "../components/Card";
import AuthContext from "../context/AuthProvider";
import axios from "axios";

function Following() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { authTokens } = useContext(AuthContext);
  const observer = useRef();

  const fetchTweets = async (pageNumber = 1) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/following-feed/?page=${pageNumber}`,
        {
          headers: {
            Authorization: `Bearer ${authTokens?.access}`,
          },
        }
      );

      if (pageNumber === 1) {
        setTweets(response.data.tweets);
      } else {
        setTweets((prev) => [...prev, ...response.data.tweets]);
      }

      setHasMore(pageNumber < response.data.total_pages);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tweets from people you follow");
      console.error("Error fetching following feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const lastTweetElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
          fetchTweets(page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleTweetUpdate = (updatedTweet) => {
    setTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.id === updatedTweet.id ? updatedTweet : tweet
      )
    );
  };

  if (loading && tweets.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <h1 className="text-blue-900 font-bold p-4 border-b border-gray-400 sticky bg-white top-0 z-10">
        Following
      </h1>

      {tweets.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No tweets from people you follow yet. Start following people to see
          their tweets here!
        </div>
      ) : (
        <div className="border-b border-gray-200">
          {tweets.map((tweet, index) => (
            <div
              key={tweet.id}
              ref={index === tweets.length - 1 ? lastTweetElementRef : null}
            >
              <Card tweet={tweet} onTweetUpdate={handleTweetUpdate} />
            </div>
          ))}
          {loading && (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Following;
