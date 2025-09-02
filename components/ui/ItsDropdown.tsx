"use client";
import React, { useState, useRef, useEffect } from "react";

interface Props {
  closeWhenClicked?: boolean;
  children: React.ReactNode;
  btnText: React.ReactNode | string;
  btnClassNames?: string;
  menuClassNames?: string;
}
const ItsDropdown = ({
  closeWhenClicked = false,
  children,
  btnText,
  btnClassNames,
  menuClassNames,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropBtnRef = useRef<HTMLButtonElement>(null);

  // Toggle dropdown open/close on button click
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  // Close dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        dropBtnRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !dropBtnRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up listener on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <article className="relative w-full flex justify-center items-center">
      <div className="relative">
        <button
          type="button"
          className={`cursor-pointer mb-1 ${btnClassNames}`}
          ref={dropBtnRef}
          onClick={handleToggle}
        >
          {btnText}
        </button>

        <div
          onClick={() => closeWhenClicked && handleToggle()}
          ref={dropdownRef}
          className={`absolute selection:bg-transparent transition-all duration-400 z-50 min-w-[8rem] rounded-md border bg-slate-500 dark:bg-slate-700 bg-opacity-80 shadow-md ${
            isOpen
              ? `opacity-100 p-2 w-fit h-fit overflow-visible ${
                  menuClassNames && menuClassNames
                }`
              : "opacity-0 p-0 w-0 h-0 overflow-hidden"
          }`}
        >
          <div className="z-50 flex flex-col gap-2">
            <div className="z-0 absolute left-0 right-0 top-0 bottom-0 rounded-md backdrop-blur-md"></div>{" "}
            <ul className="text-shadow z-50">{children}</ul>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ItsDropdown;
