"use client";

import { useEffect, useState } from "react";

function pulse(footer: HTMLElement) {
  footer.removeAttribute("data-pulse");
  void footer.offsetWidth; // restart the animation if it's clicked again
  footer.setAttribute("data-pulse", "on");
  setTimeout(() => footer.removeAttribute("data-pulse"), 2500);
}

export default function ContactTab() {
  const [ready, setReady] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    // On the homepage, wait until the intro animation has mostly finished
    const delay = document.documentElement.dataset.intro === "play" ? 3200 : 600;
    const timer = setTimeout(() => setReady(true), delay);

    function update() {
      setAtTop(window.scrollY < 300);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", update);
    };
  }, []);

  function goToContact() {
    const footer = document.getElementById("contact");
    if (!footer) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });

    // Animate the buttons once the footer is actually on screen
    const giveUp = setTimeout(() => observer.disconnect(), 4000);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        clearTimeout(giveUp);
        pulse(footer);
      },
      { threshold: 0.9 }
    );
    observer.observe(footer);
  }

  const show = ready && atTop;

      return (
    <button
      onClick={goToContact}
      aria-label="Jump to contact details"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`group fixed right-0 top-40 z-50 flex items-center bg-black py-3 pl-6 pr-3 text-sm font-medium text-white transition duration-500 ease-out [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,10px_50%)] motion-reduce:transition-none dark:bg-white dark:text-black ${
        show
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-full opacity-0"
      }`}
    >
      <span
        aria-hidden
        className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[5rem] group-hover:opacity-100 group-focus-visible:max-w-[5rem] group-focus-visible:opacity-100"
      >
        Contact
      </span>

      <span className="relative flex h-4 w-4 items-center justify-center">
        <svg
          className="absolute transition duration-300 group-hover:rotate-90 group-hover:scale-50 group-hover:opacity-0 group-focus-visible:rotate-90 group-focus-visible:scale-50 group-focus-visible:opacity-0"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
        <span
          aria-hidden
          className="absolute scale-50 -rotate-90 text-base font-semibold opacity-0 transition duration-300 group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:rotate-0 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        >
          ?
        </span>
      </span>
    </button>
  );
}