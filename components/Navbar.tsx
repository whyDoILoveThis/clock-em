import { UserButton } from "@clerk/nextjs";
import React from "react";
import { ThemeToggler } from "./ThemeToggler";
import { FaClock } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className=" z-[999] fixed top-0 w-screen max-w-[800px] border-b flex justify-between p-1 px-2 items-center backdrop-blur-md">
      <h1 className="flex items-center gap-1 text-2xl font-extrabold ">
        <FaClock /> Clock &#39;em
      </h1>
      <div className="flex items-center gap-2">
        <UserButton />
        <ThemeToggler />
      </div>
    </nav>
  );
};

export default Navbar;
