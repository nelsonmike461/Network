import React, { useContext, useEffect, useState } from "react";
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
import AuthContext from "../context/AuthProvider";

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
  const { authTokens, user } = useContext(AuthContext);

  const fetchData = async (page) => {
    try {
      const config = {
        headers: authTokens
          ? {
              Authorization: `Bearer ${authTokens.access}`,
            }
          : {},
      };

      const response = await axios.get(
        `http://localhost:8000/api/home?page=${page}`,
        config
      );
      const data = response.data;

      setTweets(data.recent_tweets);
      setMostLikedTweets(data.most_liked_tweets);
      setMostCommentedTweets(data.most_commented_tweets);
      setTotalPages(data.total_pages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
    // Reset scroll position when page changes
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
    document.addEventListener("tweetCreated", handleNewTweet);
    return () => {
      document.removeEventListener("tweetCreated", handleNewTweet);
    };
  }, [currentPage, authTokens]);

  const handleNewTweet = (event) => {
    setTweets((prevTweets) => [event.detail, ...prevTweets]);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const handleTweetUpdate = (updatedTweet) => {
    // Update recent tweets
    setTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.id === updatedTweet.id ? updatedTweet : tweet
      )
    );

    // Update most liked tweets
    setMostLikedTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.id === updatedTweet.id ? updatedTweet : tweet
      )
    );

    // Update most commented tweets
    setMostCommentedTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.id === updatedTweet.id ? updatedTweet : tweet
      )
    );

    // Update modal tweets if open
    if (isModalOpen) {
      setModalTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet.id === updatedTweet.id ? updatedTweet : tweet
        )
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
        onTweetUpdate={handleTweetUpdate}
        setLoginModalOpen={setIsLoginModalOpen}
        isAuthenticated={!!user}
      />
    ));
  };

  const renderSideSection = (title, tweets, type) => {
    const tweetsToShow = tweets.slice(0, 3);
    return (
      <div
        className="h-1/2 overflow-y-scroll scrollbar-hide"
        style={{ height: "50vh" }}
      >
        <h2 className="p-3 font-bold text-l mb-1 text-blue-900 sticky top-0 bg-white">
          {title}
        </h2>
        <div className="p-3">
          {tweetsToShow.map((tweet) => (
            <SideCard
              key={tweet.id}
              tweet={tweet}
              type={type}
              onTweetUpdate={handleTweetUpdate}
              setLoginModalOpen={setIsLoginModalOpen}
              isAuthenticated={!!user}
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {renderTweets(modalTweets)}
      </Modal>
      <LoginModal isOpen={isLoginModalOpen} onClose={handleLoginModalClose} />
    </div>
  );
}

export default Home;
