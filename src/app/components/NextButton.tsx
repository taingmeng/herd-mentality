"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function NextButton() {
  const router = useRouter();

  const nextQuestion = () => {
    router.refresh()
  };

  return (
    <div className="w-full m-8">
    <Button onClick={nextQuestion}>
      Next
      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
        -&gt;
      </span>
    </Button>
    </div>
  );
}
