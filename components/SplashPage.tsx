import { SignInButton } from "@clerk/nextjs";
import React from "react";

const SplashPage = () => {
  return (
    <div>
      <p>please sign in to use this application</p>
      <SignInButton mode="modal" />
    </div>
  );
};

export default SplashPage;
