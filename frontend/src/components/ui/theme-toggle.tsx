import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <button type="button" aria-label="Dark mode" aria-pressed={dark}
      className="theme-toggle relative h-6 w-11 shrink-0 rounded-full border"
      onClick={() => setTheme(dark ? "light" : "dark")}>
      <span className={`absolute left-0.5 top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${dark ? "translate-x-5" : ""}`}>
        {dark ? <Moon size={13} aria-hidden="true" /> : <Sun size={13} aria-hidden="true" />}
      </span>
    </button>
  );
}
