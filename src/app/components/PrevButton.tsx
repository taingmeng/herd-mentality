"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

interface PreviousButtonProps {
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  children?: any;
  className?: string;
  disabled?: boolean
}

export default function PrevButton({ onClick, children, className, disabled }: PreviousButtonProps) {
  const router = useRouter();

  const nextQuestion = () => {
    router.refresh()
  };

  return (
    <Button
      className={`${className} w-full`}
      onClick={onClick || nextQuestion}
      disabled={disabled}>
      &lt;- {children || "Previous"}
    </Button>
  );
}
