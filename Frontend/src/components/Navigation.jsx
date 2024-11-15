import React from "react";
import { BsGlobe } from "react-icons/bs";

function Navigation() {
  return (
    <nav className=" flex items-center flex-col w-2/12 h-screen  text-black p-4 fixed border-r border-gray-400">
      <span className="flex items-center gap-3 text-blue-900 mb-6 mt-3">
        <BsGlobe size={25} /> <h3 className="text-xl font-semibold">Network</h3>
      </span>
      <ul className="flex flex-col items-center w-full gap-y-3 mt-2">
        <li className="p-2 bg-gray-200 text-center w-full rounded-full shadow">
          <a href="#">Home</a>
        </li>
        <li className="p-2 bg-gray-200 text-center w-full rounded-full shadow">
          <a href="#">Profile</a>
        </li>
        <li className="p-2 bg-gray-200 text-center w-full rounded-full shadow">
          <a href="#">Following</a>
        </li>
        <li className="p-2 bg-blue-800 text-white text-center w-full rounded-full">
          <a href="#">Post</a>
        </li>
        <li className="p-2 bg-blue-800 text-white text-center w-full rounded-full">
          <a href="#">Login</a>
        </li>
        <li className="p-2 bg-blue-800 text-white text-center w-full rounded-full">
          <a href="#">Register</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
