import { UserButton } from "@clerk/nextjs";
import React from "react";
import { ThemeToggler } from "./ThemeToggler";

const Navbar = () => {
  return (
    <nav className="border-b flex justify-between p-1 px-2 items-center">
      <h1 className="text-2xl font-extrabold">Clock &#39;em</h1>
      <div className="flex items-center gap-2">
        <UserButton />
        <ThemeToggler />
      </div>
    </nav>
  );
};

export default Navbar;
