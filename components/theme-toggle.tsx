
"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

// Tránh lỗi hydration giữa server và client.
const subscribe = () => () => { };
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Icon mặt trời - dạng outline.
function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
  );
}

// Icon mặt trăng - dạng outline.
function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const isDark = theme === "dark";

  function toggleTheme() {
    if (!mounted) return;

    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label="Đổi giao diện sáng hoặc tối"
      title="Đổi giao diện"
      className="
        inline-flex min-w-[100px]
        items-center justify-center gap-2
        rounded-xl border border-line
        bg-card px-3 py-2
        text-sm font-medium text-foreground
        shadow-sm
        transition-colors duration-300 ease-in-out
        hover:bg-muted
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-brand
        disabled:opacity-50
      "
    >
      {!mounted ? (
        <span>Sáng/Tối</span>
      ) : isDark ? (
        <>
          <SunIcon />
          <span>Sáng</span>
        </>
      ) : (
        <>
          <MoonIcon />
          <span>Tối</span>
        </>
      )}
    </button>
  );
}
