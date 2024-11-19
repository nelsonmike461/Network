import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaLongArrowAltRight } from "react-icons/fa";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { Route, Routes } from "react-router-dom";
import Navigation from "../components/Navigation";
import Card from "../components/Card";
import SideCard from "../components/SideCard";
import Modal from "../components/Modal";
import Profile from "./Profile";
import Following from "./Following";
import LoginModal from "../components/LoginModal";
import Details from "../components/Details";

function Home() {
  const [tweets, setTweets] = useState([]);
  const [mostLikedTweets, setMostLikedTweets] = useState([]);
  const [mostCommentedTweets, setMostCommentedTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTweets, setModalTweets] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    fetchData(currentPage);
    document.addEventListener("tweetCreated", handleNewTweet);
    document.addEventListener("commentAdded", handleNewComment);

    return () => {
      document.removeEventListener("tweetCreated", handleNewTweet);
      document.removeEventListener("commentAdded", handleNewComment);
    };
  }, [currentPage]);

  const fetchData = (page) => {
    axios
      .get(`http://localhost:8000/api/home?page=${page}`)
      .then((response) => {
        const data = response.data;
        setTweets(data.recent_tweets);
        setMostLikedTweets(data.most_liked_tweets);
        setMostCommentedTweets(data.most_commented_tweets);
        setTotalPages(data.total_pages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the data!", error);
        setLoading(false);
      });
  };

  const handleNewTweet = (event) => {
    setTweets((prevTweets) => [event.detail, ...prevTweets]);
  };

  const handleNewComment = (event) => {
    const { tweetId, updatedTweet } = event.detail;

    // Update tweets list
    setTweets((prevTweets) =>
      prevTweets.map((tweet) => (tweet.id === tweetId ? updatedTweet : tweet))
    );

    // Update most liked tweets
    setMostLikedTweets((prevTweets) =>
      prevTweets.map((tweet) => (tweet.id === tweetId ? updatedTweet : tweet))
    );

    // Update most commented tweets and resort
    setMostCommentedTweets((prevTweets) => {
      const updatedTweets = prevTweets.map((tweet) =>
        tweet.id === tweetId ? updatedTweet : tweet
      );
      return [...updatedTweets].sort(
        (a, b) => b.comments_count - a.comments_count
      );
    });
  };

  const updateTweetInList = (tweetList, updatedTweet) =>
    tweetList.map((tweet) =>
      tweet.id === updatedTweet.id ? updatedTweet : tweet
    );

  const handleTweetUpdate = (updatedTweet) => {
    setTweets((prevTweets) => updateTweetInList(prevTweets, updatedTweet));
    setMostLikedTweets((prevTweets) =>
      updateTweetInList(prevTweets, updatedTweet)
    );
    setMostCommentedTweets((prevTweets) =>
      updateTweetInList(prevTweets, updatedTweet)
    );
    if (modalTweets.length > 0) {
      setModalTweets((prevTweets) =>
        updateTweetInList(prevTweets, updatedTweet)
      );
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderTweets = (tweetList) => {
    return tweetList.map((tweet) => (
      <Card
        key={tweet.id}
        tweet={tweet}
        setLoginModalOpen={setIsLoginModalOpen}
        onTweetUpdate={handleTweetUpdate}
      />
    ));
  };

  const renderSideSection = (title, tweets, type) => {
    const tweetsToShow = tweets.slice(0, 3);
    return (
      <div className="p-4 h-1/2">
        <h2 className="font-bold text-xl mb-4 text-blue-900">{title}</h2>
        {tweetsToShow.map((tweet) => (
          <SideCard
            key={tweet.id}
            tweet={tweet}
            type={type}
            onTweetUpdate={handleTweetUpdate}
          />
        ))}
        {tweets.length > 3 && (
          <button
            onClick={() => openModal(tweets)}
            className="text-blue-700 font-bold text-sm"
          >
            <div className="flex items-center space-x-2 mt-5">
              <span>See More</span> <FaLongArrowAltRight size={18} />
            </div>
          </button>
        )}
      </div>
    );
  };

  const renderPaginationButton = (direction, onClick, disabled, icon) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${
        disabled && "opacity-50 cursor-not-allowed"
      }`}
    >
      {icon}
    </button>
  );

  const renderPagination = () => (
    <div className="pagination flex justify-center space-x-2 p-4">
      {renderPaginationButton(
        "previous",
        handlePrevious,
        currentPage === 1,
        <>
          <MdOutlineKeyboardDoubleArrowLeft className="mr-2" />
          Previous
        </>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => handlePageChange(pageNumber)}
          className={`px-4 py-2 text-sm font-medium ${
            currentPage === pageNumber
              ? "text-blue-600 bg-blue-100"
              : "text-gray-700 bg-white"
          } border border-gray-300 rounded-md hover:bg-gray-50`}
        >
          {pageNumber}
        </button>
      ))}
      {renderPaginationButton(
        "next",
        handleNext,
        currentPage === totalPages,
        <>
          Next
          <MdKeyboardDoubleArrowRight className="ml-2" />
        </>
      )}
    </div>
  );

  const openModal = (tweets) => {
    setModalTweets(tweets);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-2">
        <Navigation />
      </div>
      <main className="col-span-7 border-r border-gray-400 overflow-y-scroll scrollbar-hide">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1 className="text-blue-900 font-bold p-4 border-b border-gray-400 sticky bg-white top-0 z-10">
                  Recent Tweets
                </h1>
                {renderTweets(tweets)}
                {renderPagination()}
              </>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/following" element={<Following />} />
          <Route path="/tweet/:id" element={<Details />} />
        </Routes>
      </main>
      <aside className="col-span-3 divide-y divide-gray-400">
        {renderSideSection("Most Liked Tweets", mostLikedTweets, "likes")}
        {renderSideSection(
          "Most Commented Tweets",
          mostCommentedTweets,
          "comments"
        )}
      </aside>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {renderTweets(modalTweets)}
      </Modal>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default Home;
