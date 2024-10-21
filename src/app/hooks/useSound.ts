import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from 'react'

export default function useSound<Audio>(
  filePath: string
): Audio {
  const isMounted = useRef(false)
  const sound = useRef(
    typeof Audio !== "undefined" ? new Audio(filePath) : undefined
  );

  const play = useCallback(() => {
    if (isMounted.current && sound.current) {
      sound.current.pause();
      sound.current.currentTime = 0;
      sound.current.play();
    } else {
      isMounted.current = true
    }
  }, [sound])


  return play;
}