import { MouseEventHandler } from "react";

interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  children?: any;
  className?: string;
  disabled?: boolean;
}

export default function BigButton({
  onClick,
  children,
  className,
  disabled,
}: ButtonProps) {
  return (
    <button
      className={`${className} w-full h-20 font-bold py-4 px-2 rounded rounded-lg border transition-colors cursor-pointer text-center align-middle
         flex justify-center items-center
         text-white text-3xl
         outline-none
         select-none
         border-transparent
    bg-pink-950 border-pink-200
    active:border-pink-400 active:bg-pink-800/30
    ${disabled ? "pointer-events-none !bg-gray-300" : "pointer-events-auto"}`}
      onClick={() => {
        window.document.body.focus();
        onClick &&
          onClick({} as React.MouseEvent<HTMLButtonElement, MouseEvent>);
      }}
    >
      {children}
    </button>
  );
}
