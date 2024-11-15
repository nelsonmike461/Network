import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaLongArrowAltRight } from "react-icons/fa";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import Navigation from "./components/Navigation";
import Card from "./components/Card";
import SideCard from "./components/SideCard";
import Modal from "./components/Modal";

function Home() {
  const [tweets, setTweets] = useState([]);
  const [mostLikedTweets, setMostLikedTweets] = useState([]);
  const [mostCommentedTweets, setMostCommentedTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoreLiked, setShowMoreLiked] = useState(false);
  const [showMoreCommented, setShowMoreCommented] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTweets, setModalTweets] = useState([]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = (page) => {
    axios
      .get(`http://localhost:8000/api/home?page=${page}`)
      .then((response) => {
        const data = response.data;
        console.log(data);
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

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      setLoading(true);
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

  const openModal = (tweets) => {
    setModalTweets(tweets);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const likedTweetsToShow = showMoreLiked
    ? mostLikedTweets
    : mostLikedTweets.slice(0, 3);
  const commentedTweetsToShow = showMoreCommented
    ? mostCommentedTweets
    : mostCommentedTweets.slice(0, 3);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-2">
        <Navigation />
      </div>
      <main className="col-span-7 border-r border-gray-400 overflow-y-scroll scrollbar-hide">
        <h1 className="text-blue-900 font-bold p-4 border-b border-gray-400">
          Recent Tweets
        </h1>
        {tweets.map((tweet, index) => (
          <Card key={index} tweet={tweet} />
        ))}
        <div className="pagination flex justify-center space-x-2 p-4">
          <button
            onClick={handlePrevious}
            className={`text-blue-900 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={currentPage === 1}
          >
            <MdOutlineKeyboardDoubleArrowLeft />
          </button>
          {[...Array(totalPages).keys()].map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number + 1)}
              className={`text-blue-500 ${
                currentPage === number + 1 ? "font-bold" : ""
              }`}
            >
              {number + 1}
            </button>
          ))}
          <button
            onClick={handleNext}
            className={`text-blue-500 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
      </main>
      <aside className="col-span-3 divide-y divide-gray-400">
        <div className="p-4 h-1/2">
          <h2 className="font-bold text-xl mb-4 text-blue-900">
            Most Liked Tweets
          </h2>
          {likedTweetsToShow.map((tweet, index) => (
            <SideCard key={index} tweet={tweet} type="likes" />
          ))}
          {mostLikedTweets.length > 3 && (
            <button
              onClick={() => openModal(mostLikedTweets)}
              className="text-blue-700 font-bold text-sm"
            >
              <div className="flex items-center space-x-2 mt-5">
                <span>See More</span> <FaLongArrowAltRight size={18} />
              </div>
            </button>
          )}
        </div>
        <div className="p-4 h-1/2">
          <h2 className="font-bold text-xl mb-4 text-blue-900">
            Most Commented Tweets
          </h2>
          {commentedTweetsToShow.map((tweet, index) => (
            <SideCard key={index} tweet={tweet} type="comments" />
          ))}
          {mostCommentedTweets.length > 3 && (
            <button
              onClick={() => openModal(mostCommentedTweets)}
              className="text-blue-700 font-bold text-sm"
            >
              <div className="flex items-center space-x-2 mt-5">
                <span>See More</span> <FaLongArrowAltRight size={18} />
              </div>
            </button>
          )}
        </div>
      </aside>
      <Modal show={isModalOpen} onClose={closeModal}>
        {modalTweets.map((tweet, index) => (
          <Card key={index} tweet={tweet} />
        ))}
      </Modal>
    </div>
  );
}

export default Home;
