import { SignInButton } from "@clerk/nextjs";
import React from "react";

const SplashPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <p>Please sign in to use this application😊</p>
      <button className="btn">
        <SignInButton mode="modal" />
      </button>
    </div>
  );
};

export default SplashPage;
