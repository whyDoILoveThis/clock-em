"use client";

import React, { useEffect, useRef } from "react";

type MouseRopeProps = {
  numSegments?: number;
  color?: string;
  size?: number;
  speed?: number;
  glow?: boolean;
};

export default function MouseRope({
  numSegments = 20,
  color = "white",
  size = 12,
  speed = 0.25,
  glow = true,
}: MouseRopeProps) {
  const segmentsRef = useRef<HTMLDivElement[]>([]);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const positions = Array(numSegments).fill({ ...mouse.current });

    const animate = () => {
      positions[0] = { ...mouse.current };

      for (let i = 1; i < numSegments; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;

        positions[i] = {
          x: curr.x + dx * speed,
          y: curr.y + dy * speed,
        };
      }

      positions.forEach((pos, i) => {
        const el = segmentsRef.current[i];
        if (el) {
          el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [numSegments, speed]);

  return (
    <>
      {Array.from({ length: numSegments }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) segmentsRef.current[i] = el;
          }}
          className={`fixed top-0 left-0 pointer-events-none transition-transform duration-100 ${
            glow ? "backdrop-blur-md shadow-lg" : ""
          }`}
          style={{
            width: size,
            height: size,
            borderRadius: "9999px",
            backgroundColor: color,
            zIndex: 9999,
          }}
        />
      ))}
    </>
  );
}
