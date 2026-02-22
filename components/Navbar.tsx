import { UserButton } from "@clerk/nextjs";
import React from "react";
import { ThemeToggler } from "./ThemeToggler";
import { FaClock } from "react-icons/fa";

const Navbar = () => {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <nav className=" z-[999] fixed top-0 w-screen max-w-[800px] border-b flex justify-between p-1 px-2 items-center backdrop-blur-md">
      <div className="flex flex-col">
        <h1 className="flex items-center gap-1 text-2xl font-extrabold ">
          <FaClock /> Clock &#39;em
        </h1>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 -mt-0.5 ml-0.5">
          {today}
        </span>
      </div>
      <div className="flex items-center gap-2 mr-4">
        <UserButton />
        <ThemeToggler />
      </div>
    </nav>
  );
};

export default Navbar;
