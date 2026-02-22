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
          className={`cursor-pointer transition-all duration-200 ${btnClassNames}`}
          ref={dropBtnRef}
          onClick={handleToggle}
        >
          {btnText}
        </button>

        <div
          onClick={() => closeWhenClicked && handleToggle()}
          ref={dropdownRef}
          className={`absolute selection:bg-transparent transition-all duration-300 z-50 min-w-[10rem] rounded-xl overflow-hidden ${
            isOpen
              ? `opacity-100 p-3 w-fit h-fit overflow-visible`
              : "opacity-0 p-0 w-0 h-0 overflow-hidden pointer-events-none"
          }`}
          style={{
            transform: isOpen
              ? "scale(1) translateY(0)"
              : "scale(0.95) translateY(-8px)",
            transformOrigin: "top center",
          }}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-slate-400/20 dark:via-slate-500/10 dark:to-transparent rounded-xl pointer-events-none" />

          {/* Background with glass effect */}
          <div className="absolute inset-0 rounded-xl backdrop-blur-xl bg-white/20 dark:bg-slate-900/30 border border-white/20 dark:border-slate-700/30 pointer-events-none" />

          {/* Shadow effect */}
          <div className="absolute -inset-1 rounded-xl -z-10 blur-xl opacity-20 dark:opacity-30 bg-gradient-to-br from-blue-500 to-purple-500 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-1">
            <ul className="space-y-1">{children}</ul>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ItsDropdown;
