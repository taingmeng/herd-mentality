"use client";

import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { getMarkdownContentReact } from "../utils/MarkdownUtilReact";
import { GAME_NAME, GAME_PATH } from "./Constants";

interface RulesProps {
  visible: boolean;
  onClose: () => void;
}

const RULES_PATH = `/${GAME_PATH}/rules.md`; // Adjust the import path as necessary

export default function Rules({ visible, onClose }: RulesProps) {
  const [ruleContent, setRuleContent] = useState<string>("");
  useEffect(() => {
    async function fetchRules() {
      fetch(RULES_PATH)
        .then((response) => response.text())
        .then((text) => getMarkdownContentReact(text))
        .then(({ content }) => {
          const replacedContent = content.replaceAll("{{ GAME_NAME }}", GAME_NAME);
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
      title={GAME_NAME + " Rules"}
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
