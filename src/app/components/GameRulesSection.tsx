"use client";

import { useEffect, useState } from "react";
import { getMarkdownContentReact } from "../utils/MarkdownUtilReact";

interface Props {
  gamePath: string;
  gameName: string;
}

export default function GameRulesSection({ gamePath, gameName }: Props) {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/${gamePath}/rules.md`)
      .then((r) => r.text())
      .then((text) => getMarkdownContentReact(text))
      .then(({ content }) =>
        setContent(content.replaceAll("{{ GAME_NAME }}", gameName))
      )
      .catch(() => {});
  }, [gamePath, gameName]);

  if (!content) return null;

  return (
    <div
      className="markdown mt-8 max-w-2xl"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
