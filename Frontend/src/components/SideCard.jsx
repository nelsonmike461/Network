import React from "react";

function SideCard({ tweet, type }) {
  return (
    <div className="mb-4">
      <span className="font-bold block mb-1 text-blue-700">{tweet.poster}</span>
      <div className="flex items-center space-x-6">
        {type === "likes" && (
          <>
            <span className="text-sm font-semibold text-gray-700">
              Likes &middot; {tweet.likes_count}
            </span>
            <p className="text-gray-600 text-sm">{tweet.tweet}</p>
          </>
        )}
        {type === "comments" && (
          <>
            <span className="text-sm font-semibold text-gray-700">
              Comments &middot; {tweet.comments_count}
            </span>
            <p className="text-gray-600 text-sm">{tweet.tweet}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default SideCard;
