"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

interface NextButtonProps {
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  children?: any;
  className?: string;
  disabled?: boolean;
}

export default function NextButton({ onClick, children, className, disabled }: NextButtonProps) {
  const router = useRouter();

  const nextQuestion = () => {
    router.refresh()
  };

  return (
    <Button className={`${className} w-full`}
      onClick={onClick || nextQuestion}
      disabled={disabled}>
      {children || "Next"} -&gt;
    </Button>
  );
}
