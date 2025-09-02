import React from "react";

interface Props {
  color?: string;
}

const LoaderSpinSmall = ({ color }: Props) => {
  return (
    <div
      className={`loader-spin-small ${
        color && (color === "red" || color === "Red") && "loader-red"
      } ${color && (color === "green" || color === "Green") && "loader-green"}`}
    />
  );
};

export default LoaderSpinSmall;
