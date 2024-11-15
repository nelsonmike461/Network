import React from "react";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import profileImage from "../assets/Profile.png";

function Card({ tweet }) {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="border-b border-gray-400 p-4 flex">
      <img
        src={profileImage}
        alt="dummy profile image"
        className="w-12 h-12 rounded-full border-2 border-blue-700 bg-blue-700 mr-4"
      />
      <div className="flex-grow">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="font-bold text-blue-700">{tweet.poster}</span>
          </div>
          <span className="text-gray-500 text-sm">
            {formatDate(tweet.date_posted)}
          </span>
        </div>
        <p className="mb-4 text-gray-700 text-sm">{tweet.tweet}</p>
        <div className="flex items-center space-x-16 text-gray-500 text-xs">
          <div className="flex items-center space-x-1">
            <FaRegHeart className="mr-1" /> &middot;{" "}
            <span>{tweet.likes_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaRegComment className="mr-1" /> &middot;{" "}
            <span>{tweet.comments_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
