"use client";

import React from "react";

const Round = ({ round }: { round: number }) => {
  return (
    <div className="select-none cursor-pointer">
      <div className="flex flex-col justify-center items-center">
        <span>Round</span>
        <h2 className="w-20 m-0 text-center text-5xl">{round}</h2>
      </div>
    </div>
  );
};

export default Round;
