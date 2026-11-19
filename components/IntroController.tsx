"use client";

import { useEffect } from "react";

export default function IntroController() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") return;

    try {
      localStorage.setItem("intro-last-seen", String(Date.now()));
    } catch {}

    setTimeout(() => {
      root.dataset.intro = "done";
    }, 4000);
  }, []);

  return null;
}