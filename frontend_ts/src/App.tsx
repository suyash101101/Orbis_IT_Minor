import { useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { TabsNav } from "./components/Navbar";

function App() {
  // Initialize theme based on localStorage or user preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      document.documentElement.classList.add(savedTheme);
    } else if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <TabsNav />
        <main className="flex-1 overflow-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App

