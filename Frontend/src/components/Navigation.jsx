import React, { useContext, useState } from "react";
import { BsGlobe } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import LoginModal from "./LoginModal";
import AuthContext from "../context/AuthProvider";
import RegisterModal from "./RegisterModal";
import { Link } from "react-router-dom";
import TweetModal from "./TweetModal";

function Navigation() {
  const { registerUser, user, logoutUser } = useContext(AuthContext);
  const [registerModal, setRegisterModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [postModal, setPostModal] = useState(false);

  // Updated to handle new tweet without page reload
  const handlePostModal = (success, newTweet) => {
    setPostModal(false);
    if (success && newTweet) {
      // Dispatch custom event for tweet creation
      const event = new CustomEvent("tweetCreated", {
        detail: newTweet,
        bubbles: true,
      });
      document.dispatchEvent(event);
    }
  };

  const openLoginModal = () => setLoginModal(true);
  const closeLoginModal = () => setLoginModal(false);

  const openRegisterModal = () => setRegisterModal(true);
  const closeRegisterModal = () => setRegisterModal(false);

  const handleRegister = async (e) => {
    const response = await registerUser(e);

    if (response?.success) {
      setRegisterModal(false);
      setLoginModal(true);
    }
    return response;
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <nav className="flex flex-col justify-between w-2/12 h-screen text-black p-4 fixed border-r border-gray-400">
      <div>
        <span className="flex items-center justify-center gap-2 text-blue-900 mb-6 mt-3 ">
          <BsGlobe size={25} />
          <h3 className="text-xl font-semibold">Network</h3>
        </span>
        <ul className="flex flex-col items-center w-full gap-y-3 mt-2">
          {user ? (
            <>
              <li className="p-2 bg-gray-200 text-center w-full text-blue-900 font-bold border-t border-b border-blue-900">
                <a href="#">{user.username}</a>
              </li>
              <li className="p-2 bg-gray-200 text-center w-full rounded-full shadow">
                <Link to="/">Home</Link>
              </li>
              <li className="p-2 bg-gray-200 text-center w-full rounded-full shadow">
                <Link to="/profile">Profile</Link>
              </li>
              <li className="p-2 bg-gray-200 text-center w-full rounded-full shadow">
                <Link to="/following">Following</Link>
              </li>
              {user && (
                <button
                  onClick={() => setPostModal(true)}
                  className="bg-blue-700 text-white rounded-full p-2 font-bold hover:bg-blue-600 transition-colors mt-4 w-full"
                >
                  Tweet
                </button>
              )}
            </>
          ) : (
            <>
              <li
                className="p-2 bg-blue-800 text-white text-center w-full rounded-full cursor-pointer"
                onClick={openLoginModal}
              >
                <a href="#">Login</a>
              </li>
              <li
                className="p-2 bg-blue-800 text-white text-center w-full rounded-full cursor-pointer"
                onClick={openRegisterModal}
              >
                <a href="#">Register</a>
              </li>
            </>
          )}
        </ul>
      </div>
      {user && (
        <ul>
          <li
            className="p-2 bg-blue-800 text-white text-center w-full rounded-full hover:bg-red-600 shadow-md transition-colors cursor-pointer"
            onClick={handleLogout}
          >
            <button className="flex items-center justify-center gap-2 w-full">
              <TbLogout />
              Logout
            </button>
          </li>
        </ul>
      )}
      <LoginModal isOpen={loginModal} onClose={closeLoginModal} />
      <RegisterModal
        isOpen={registerModal}
        onClose={closeRegisterModal}
        onRegister={handleRegister}
      />
      <TweetModal isOpen={postModal} onClose={handlePostModal} />
    </nav>
  );
}

export default Navigation;
