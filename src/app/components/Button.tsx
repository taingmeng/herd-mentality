interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  children?: any;
  className?: string;
  disabled?: boolean;
}

export function Button({ onClick, children, className, disabled }: ButtonProps) {
  return (
    <div className={`${className} font-bold py-4 px-2 rounded rounded-lg border transition-colors cursor-pointer
      text-center text-white
    prevent-select
    flex justify-center items-center
    border-transparent
    border-pink-200
    active:border-pink-400 active:bg-pink-800/30
    ${disabled ? 
      "pointer-events-none !bg-gray-300" :
      "pointer-events-auto"}`}
    onClick={onClick}>
      {children}
    </div>
  );
}

export default Button;
