"use client";
import { useEffect } from "react";

const SPINNER =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><style>@keyframes s{to{transform:rotate(360deg)}}.r{animation:s .8s linear infinite;transform-origin:12px 12px}</style><circle class='r' cx='12' cy='12' r='9' fill='none' stroke='%23888' stroke-width='2.5' stroke-dasharray='42 14' stroke-linecap='round'/></svg>";

export default function NavigationFavicon() {
  useEffect(() => {
    const nav = (window as any).navigation;
    if (!nav) return;

    const getLink = () =>
      document.querySelector<HTMLLinkElement>("link[rel='icon']");

    let original = getLink()?.href ?? "/favicon.ico";

    const onNavigate = () => {
      original = getLink()?.href ?? original;
      const el = getLink();
      if (el) el.href = SPINNER;
    };
    const onDone = () => {
      const el = getLink();
      if (el) el.href = original;
    };

    nav.addEventListener("navigate", onNavigate);
    nav.addEventListener("navigatesuccess", onDone);
    nav.addEventListener("navigateerror", onDone);

    return () => {
      nav.removeEventListener("navigate", onNavigate);
      nav.removeEventListener("navigatesuccess", onDone);
      nav.removeEventListener("navigateerror", onDone);
    };
  }, []);

  return null;
}
