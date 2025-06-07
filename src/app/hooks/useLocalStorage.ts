import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const isMounted = useRef(false)
  const [value, setValue] = useState<T>(defaultValue)

  const clearValue = useCallback(() => {
    window.localStorage.removeItem(key)
  }, []);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setValue(JSON.parse(item))
      }
    } catch (e) {
      console.log(e)
    }
    return () => {
      isMounted.current = false
    }
  }, [key])

  useEffect(() => {
    if (isMounted.current) {
      window.localStorage.setItem(key, JSON.stringify(value))
    } else {
      isMounted.current = true
    }
  }, [key, value])

  return [value, setValue, clearValue]
}