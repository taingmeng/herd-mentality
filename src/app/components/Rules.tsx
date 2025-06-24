"use client";

import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { getMarkdownContentReact } from "../utils/MarkdownUtilReact";

interface RulesProps {
  gameName: string;
  gamePath: string;
  visible: boolean;
  onClose: () => void;
}

export default function Rules({
  gameName,
  gamePath,
  visible,
  onClose,
}: RulesProps) {
  const RULES_PATH = `/${gamePath}/rules.md`; // Adjust the import path as necessary

  const [ruleContent, setRuleContent] = useState<string>("");
  useEffect(() => {
    async function fetchRules() {
      fetch(RULES_PATH)
        .then((response) => response.text())
        .then((text) => getMarkdownContentReact(text))
        .then(({ content }) => {
          const replacedContent = content.replaceAll(
            "{{ GAME_NAME }}",
            gameName
          );
          setRuleContent(replacedContent);
        })
        .catch((error) => {
          console.error("Error fetching rules:", error);
        });
    }
    fetchRules();
  }, []);
  return (
    <Modal
      title={gameName + " Rules"}
      visible={visible}
      onClose={onClose}
      confirmButtonText="Got it"
      onConfirm={onClose}
    >
      <div
        className="markdown"
        dangerouslySetInnerHTML={{ __html: ruleContent }}
      />
    </Modal>
  );
}
