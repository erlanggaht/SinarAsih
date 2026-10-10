"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="theme" className="text-sm font-medium">
        Tema
      </label>
      <select
        id="theme"
        value={mounted ? theme : "system"}
        onChange={(event) => setTheme(event.target.value)}
        disabled={!mounted}
        className="border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
      >
        <option value="system">Sistem</option>
        <option value="light">Terang</option>
        <option value="dark">Gelap</option>
      </select>
    </div>
  );
}
