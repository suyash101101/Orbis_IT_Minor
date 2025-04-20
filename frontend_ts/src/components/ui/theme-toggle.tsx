import { useState, useEffect } from "react";
import { Button } from "./button";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(
    () => {
      // Check localStorage first
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme && ["light", "dark"].includes(savedTheme)) {
        return savedTheme;
      }
      // Otherwise use system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
  );
  
  // Handle theme changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme && theme !== savedTheme) {
        setTheme(savedTheme);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [theme]);

  useEffect(() => {
    // Update DOM
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Update localStorage
    localStorage.setItem("theme", theme);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event("themechange"));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </Button>
  );
} 