import { useRef, useCallback } from 'react'

export default function useSound<Audio>(
  filePath: string
): (() => void) {
  const sound = useRef(
    typeof Audio !== "undefined" ? new Audio(filePath) : undefined
  );

  const play = useCallback(() => {
    if (sound.current) {
      sound.current.pause();
      sound.current.currentTime = 0;
      sound.current.play();
    }
  }, [sound])

  return play;
}