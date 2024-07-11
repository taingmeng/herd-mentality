"use client";

import { useEffect, useState, useRef, forwardRef, useImperativeHandle  } from "react";
import tickingSoundFile from "@/assets/ticking.mp3";

interface CircularTimerProps {
  duration: number;
  onEnded?: () => void;
}

export interface CircularTimerRefProps {
  reset: () => void;
  go: () => void;
}

const CircularTimer = forwardRef(({
  duration,
  onEnded,
}: CircularTimerProps, ref) => {
  const tickingSound = useRef(new Audio(tickingSoundFile));
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);

  useImperativeHandle(ref, () => ({
    reset() {
      setTimeLeft(duration);
      setRunning(false);
    },

    go() {
      setRunning(true);
      setPaused(false);
    }
  }));

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused && running) {
        setTimeLeft(timeLeft - 1);
        if (timeLeft <= 10) {
          tickingSound.current?.play();
        }
      }
    }, 1000);
    if (timeLeft < 1) {
      clearInterval(id);
      if (onEnded) {
        setRunning(false);
        onEnded();
      }
    }
    return () => clearInterval(id);
  }, [timeLeft, duration, setTimeLeft, paused, running, onEnded, tickingSound]);

  const percentage = (timeLeft / duration) * 100;

  const circleWidth = 120;
  const circleHeight = 120;
  const radius = 50;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <div className="relative my-4 select-none cursor-pointer" onClick={() => setPaused(!paused)}>
      <svg
        width={circleWidth}
        height={circleHeight}
        viewBox={`0 0 ${circleWidth} ${circleHeight}`}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <defs>
          <linearGradient id="gradient">
            <stop offset="10%" stop-color="#e62e62" />
            <stop offset="50%" stop-color="#b30559" />
            <stop offset="100%" stop-color="#91005c" />
          </linearGradient>
        </defs>
        <circle
          cx={circleWidth / 2}
          cy={circleHeight / 2}
          strokeWidth="3px"
          r={radius}
          className="circle-background"
        />

        <circle
          cx={circleWidth / 2}
          cy={circleHeight / 2}
          strokeWidth="10px"
          r={radius}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
          }}
          transform={`rotate(-90 ${circleWidth / 2} ${circleWidth / 2})`}
          className="circle-progress transition-stroke-width duration-1000 ease-linear"
          stroke="url(#gradient)"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center">
        <span>{paused ? "Paused" : "Time"}</span>
        <h2 className="w-20 m-0 text-center text-5xl">{timeLeft}</h2>
      </div>
    </div>
  );
});

CircularTimer.displayName = "CircularTimer";

export default CircularTimer;
