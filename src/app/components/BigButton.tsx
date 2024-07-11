interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
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
    <div
      className={`${className} w-full h-20 font-bold py-4 px-2 rounded rounded-lg border transition-colors cursor-pointer text-center align-middle
         flex justify-center items-center
         text-white
    bg-pink-700 border-transparent
    hover:border-pink-500 hover:bg-pink-200
    active:border-pink-500 active:bg-pink-500
    dark:bg-neutral-800 dark:border-pink-200
    hover:dark:border-pink-700 hover:dark:bg-neutral-800/30
    active:dark:border-pink-400 active:dark:bg-pink-800/30
    ${disabled ? "pointer-events-none !bg-gray-300" : "pointer-events-auto"}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
