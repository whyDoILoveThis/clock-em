import React from "react";
import { InfinitySpin, RotatingLines } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <RotatingLines
        width="20"
        visible={true}
        strokeWidth="5"
        strokeColor="grey"
        animationDuration="5"
        ariaLabel="rotating-lines-loading"
      />
    </div>
  );
};

export default Loader;
