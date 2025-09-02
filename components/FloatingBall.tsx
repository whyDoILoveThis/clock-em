"use client";

import React, { useEffect, useRef } from "react";

interface FloatingLightBallProps {
  size?: number;
  color?: string;
  blurAmount?: string;
  opacity?: number;
  speed?: number; // pixels per move
}

const FloatingLightBall: React.FC<FloatingLightBallProps> = ({
  size = 160,
  color = "bg-blue-400",
  blurAmount = "blur-3xl",
  opacity = 0.3,
  speed = 0.5, // lower = slower
}) => {
  const ballRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const direction = useRef({ x: 1, y: 1 });

  useEffect(() => {
    const el = ballRef.current;
    if (!el) return;

    const updatePosition = () => {
      const elBounds = el.getBoundingClientRect();
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Bounce off walls
      if (elBounds.left <= 0 || elBounds.right >= winW)
        direction.current.x *= -1;
      if (elBounds.top <= 0 || elBounds.bottom >= winH)
        direction.current.y *= -1;

      // Randomly curve direction over time
      direction.current.x += (Math.random() - 0.5) * 0.1;
      direction.current.y += (Math.random() - 0.5) * 0.1;

      // Normalize direction (unit vector)
      const mag = Math.sqrt(
        direction.current.x ** 2 + direction.current.y ** 2
      );
      direction.current.x /= mag;
      direction.current.y /= mag;

      // Update position
      position.current.x += direction.current.x * speed;
      position.current.y += direction.current.y * speed;

      // Apply transform
      el.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;

      requestAnimationFrame(updatePosition);
    };

    requestAnimationFrame(updatePosition);
  }, [speed]);

  return (
    <div
      ref={ballRef}
      className={`-z-50 fixed top-0 left-0 pointer-events-none rounded-full ${color} ${blurAmount}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity,
      }}
    />
  );
};

export default FloatingLightBall;
