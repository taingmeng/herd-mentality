import Link from "next/link";

interface LinkButtonProps {
  href?: string;
  target?: string;
  children?: any;
}

export async function LinkButton({ href, target, children }: LinkButtonProps) {
  return (
    <Link href={href || "#"} target={target || "_self"}>
      <div
        className="font-bold py-4 px-8 rounded rounded-lg border transition-colors cursor-pointer text-center
      bg-pink-200 border-transparent
      hover:border-pink-500 hover:bg-pink-200
      active:border-pink-500 active:bg-pink-500
      dark:bg-neutral-800 dark:border-pink-200
      hover:dark:border-pink-700 hover:dark:bg-neutral-800/30
      active:dark:border-pink-400 active:dark:bg-pink-800/30"
      >
        {children}
      </div>
    </Link>
  );
}

export default LinkButton;
