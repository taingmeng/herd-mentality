interface ActionButtonProps {
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  children?: any;
  className?: string;
  disabled?: boolean;
  shadowText?: string;
}

export function ActionButton({
  onClick,
  children,
  className,
  disabled,
  shadowText,
}: ActionButtonProps) {
  return (
    <button
      className={`${className}  ${
        disabled ? "pointer-events-none !bg-gray-300" : "pointer-events-auto"
      } relative group bg-[#941053] w-80 h-20 rounded-xl before:content-[''] before:absolute before:rounded-xl before:bg-[#63082d] before:w-80 before:h-20 before:-z-[1] before:left-0 before:top-2 after:content-[''] after:absolute after:rounded-xl after:bg-[#40051d] after:w-72 after:h-16 after:inset-0 after:top-2 after:mx-auto after:transition-all after:duration-150 after:ease-out after:hover:top-0`}
      onClick={onClick}
    >
      <div className="relative bg-[#041661]/20 left-0 right-0 h-16 rounded-xl mx-auto"></div>
      <div className="absolute -top-[0.1em] bg-white w-80 h-20 rounded-xl mx-auto -z-[2]"></div>
      <div className="absolute top-0 inset-x-0 mx-auto">
        <div className="relative flex justify-center bg-[#FFB20F] w-72 h-16 rounded-xl border-2 ring-1 ring-[#CB6329] border-[#CB6329] overflow-hidden mx-auto inset-0 top-2 z-[2] group-hover:-top-2 transition-all duration-150 ease-out before:content-[''] before:absolute before:bg-white/50 before:w-[0.6em] before:h-[0.6em] before:rounded-tl-[45%] before:rounded-tr-[80%] before:rounded-bl-[72%] before:rounded-br-[45%] before:bottom-[0.21em] before:left-[0.21em] before:z-[1] after:content-[''] after:absolute after:bg-white/70 after:w-[0.35em] after:h-[0.35em] after:rounded-tl-[45%] after:rounded-tr-[72%] after:rounded-bl-[80%] after:rounded-br-[45%] after:top-[0.21em] after:right-[0.21em] after:z-[1]">
          <div className="absolute top-[0.1em] bg-[#FCD425] w-full h-16 max-h-[50%] rounded-t-lg mx-auto after:content-[''] after:absolute after:bg-white after:w-full after:h-16 after:max-h-[50%] after:-top-[0.1em] after:-z-[1] after:left-0"></div>
          <span
            className={`self-center text-[2em] text-center font-sans font-black tracking-wide text-white drop-shadow-[0_1.2px_1.2px_rgba(203,99,41,0.5)] before:content-['${shadowText}'] before:absolute before:text-[#5F360B] before:-z-[1] before:top-[0.1em]`}
          >
            {children}
          </span>
        </div>
      </div>
    </button>
  );
}

export default ActionButton;
