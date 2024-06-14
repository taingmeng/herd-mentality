"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NextButton() {
  const router = useRouter();

  const nextQuestion = () => {
    router.refresh()
  };

  return (
    <div
      className="group w-full rounded-lg border border-transparent px-5 py-4 bg-gray-200 dark:bg-neutral-800 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 active:border-blue-400 active:bg-blue-100 active:dark:border-blue-400 active:dark:bg-blue-800/30 cursor-pointer text-center"
      onClick={nextQuestion}
    >
      Next
      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
        -&gt;
      </span>
    </div>
  );
}
