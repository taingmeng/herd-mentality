"use client";

import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import tickingSoundFile from "@/assets/ticking.mp3";
import useSound from "use-sound";

interface TimerProps {
  duration: number;
  state: string; // Added state prop to control the timer
  secondsLeft: number;
  onEnded?: () => void;
}

export interface CircularTimerRefProps {
  reset: () => void;
  go: () => void;
  end: () => void;
  pause: () => void;
}

const Timer = forwardRef(
  ({ duration, onEnded, state, secondsLeft }: TimerProps, ref) => {
    const [tickingSound] = useSound(tickingSoundFile);
    const [paused, setPaused] = useState(false);
    const [running, setRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
      let id: NodeJS.Timeout;
      if (state === "run") {
        id = setInterval(() => {
          setTimeLeft((timeLeft) => timeLeft - 1);
          if (timeLeft <= 0) {
            setRunning(false);
            setTimeLeft(0);
          }
        }, 1000);
      }
      if (state === "new") {
        setTimeLeft(duration);
      }
      
      return () => {
        if (id) { 
          clearInterval(id);
        }
      };
    }, [state, setTimeLeft]);

    return (
      <div
        className="select-none cursor-pointer"
        onClick={() => setPaused(!paused)}
      >
        <div className="flex flex-col justify-center items-center">
          <span>{paused ? "| |" : "Time"}</span>
          <h2 className="w-20 m-0 text-center text-5xl">
            {timeLeft >= 0 ? timeLeft : 0}
          </h2>
        </div>
      </div>
    );
  }
);

Timer.displayName = "Timer";

export default Timer;
