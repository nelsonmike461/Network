import React, { useContext, useState } from "react";
import { BsGlobe } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import LoginModal from "./LoginModal";
import AuthContext from "../context/AuthProvider";
import RegisterModal from "./RegisterModal";
import { Link, useLocation } from "react-router-dom";
import TweetModal from "./TweetModal";

function Navigation() {
  const { registerUser, user, logoutUser } = useContext(AuthContext);
  const [registerModal, setRegisterModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [postModal, setPostModal] = useState(false);
  const location = useLocation();

  const handlePostModal = (success, newTweet) => {
    setPostModal(false);
    if (success && newTweet) {
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

  // Helper function to determine if a link is active
  const isActiveLink = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Navigation link component with active state
  const NavLink = ({ to, children }) => (
    <li
      className={`w-full transition-all duration-200 ${
        isActiveLink(to)
          ? "border rounded-full border-blue-800 bg-gray-100"
          : "border rounded-full border-transparent hover:bg-blue-50"
      }`}
    >
      <Link to={to} className="p-2 block text-center w-full rounded-lg">
        {children}
      </Link>
    </li>
  );

  return (
    <nav className="flex flex-col justify-between w-2/12 h-screen text-black p-4 fixed border-r border-gray-400">
      <div>
        <span className="flex items-center justify-center gap-2 text-blue-900 mb-6 mt-3">
          <BsGlobe size={25} />
          <h3 className="text-xl font-semibold">Network</h3>
        </span>
        <ul className="flex flex-col items-center w-full gap-y-3 mt-2">
          {user ? (
            <>
              <li className="p-2 bg-gray-200 text-center w-full text-blue-900 font-bold border-t border-b border-blue-900">
                <a href="#">{user.username}</a>
              </li>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/following">Following</NavLink>
              {user && (
                <button
                  onClick={() => setPostModal(true)}
                  className="bg-blue-800 text-white rounded-full border p-2 font-bold hover:bg-gray-100 hover:text-blue-800 hover:border-blue-800 transition-colors mt-4 w-full"
                >
                  Post
                </button>
              )}
            </>
          ) : (
            <>
              <li
                className=" text-center bg-blue-800 text-white rounded-full border p-2 font-bold hover:bg-gray-100 hover:text-blue-800 hover:border-blue-800 transition-colors mt-4 w-full"
                onClick={openLoginModal}
              >
                Login
              </li>
              <li
                className=" text-center bg-blue-800 text-white rounded-full border p-2 font-semibold hover:bg-gray-100 hover:text-blue-800 hover:border-blue-800 transition-colors  w-full"
                onClick={openRegisterModal}
              >
                Register{" "}
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
