"use client";

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import tickingSoundFile from "@/assets/ticking.mp3";
import timesUpSoundFile from "@/assets/times-up.mp3";
import useSound from "use-sound";

interface CircularTimerProps {
  duration: number;
  onEnded?: () => void;
  tickSoundStartAt?: number;
}

export interface CircularTimerRefProps {
  reset: () => void;
  go: () => void;
  end: () => void;
  pause: () => void;
}

const CircularTimer = forwardRef(
  ({ duration, onEnded, tickSoundStartAt = 10 }: CircularTimerProps, ref) => {
    const [tickingSound] = useSound(tickingSoundFile);
    const [paused, setPaused] = useState(false);
    const [running, setRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [playTimesUpSound] = useSound(timesUpSoundFile);

    useImperativeHandle(ref, () => ({
      reset() {
        setTimeLeft(duration);
        setRunning(false);
        setPaused(false);
      },

      go() {
        setRunning(true);
        setPaused(false);
      },

      end() {
        setRunning(false);
        setPaused(true);
        if (onEnded) {
          onEnded();
        }
      },

      pause() {
        setRunning(false);
        setPaused(true);
      }
    }));

    useEffect(() => {
      if (!running) {
        return;
      }
      const id = setInterval(() => {
        if (!paused && running) {
          setTimeLeft(timeLeft - 1);
          if (timeLeft <= tickSoundStartAt && timeLeft > 0) {
            tickingSound();
          }
        }
      }, 1000);

      if (timeLeft < 0) {
        clearInterval(id);
        setTimeLeft(0)
        playTimesUpSound();
      }
      return () => clearInterval(id);
    }, [
      timeLeft,
      duration,
      setTimeLeft,
      paused,
      running,
      tickingSound,
    ]);

    useEffect(() => {
      if (timeLeft < 0 && running) {
        if (onEnded) {
          setRunning(false);
          onEnded();
        }
      }
    }, [onEnded, timeLeft, running]);

    const percentage = (timeLeft / duration) * 100;

    const circleWidth = 120;
    const circleHeight = 120;
    const radius = 50;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * percentage) / 100;

    return (
      <div
        className="relative my-4 select-none cursor-pointer"
        onClick={() => setPaused(!paused)}
      >
        <svg
          width={circleWidth}
          height={circleHeight}
          viewBox={`0 0 ${circleWidth} ${circleHeight}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <defs>
            <linearGradient id="gradient">
              <stop offset="10%" stopColor="#e62e62" />
              <stop offset="50%" stopColor="#b30559" />
              <stop offset="100%" stopColor="#91005c" />
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
          <span>{paused ? "| |" : "Time"}</span>
          <h2 className="w-20 m-0 text-center text-5xl">{timeLeft >= 0 ? timeLeft : 0}</h2>
        </div>
      </div>
    );
  }
);

CircularTimer.displayName = "CircularTimer";

export default CircularTimer;
