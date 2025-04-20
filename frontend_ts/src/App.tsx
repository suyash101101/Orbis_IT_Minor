import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { AuthWrapper } from "./components/AuthProvider";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateLinkHub from "./components/CreateLinkHub";
import SignIn from "./components/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import EditProfile from "./components/EditProfile";

function MainLayout() {
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
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route 
              path="/edit-profile/:username" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-linkhub" 
              element={
                <ProtectedRoute>
                  <CreateLinkHub />
                </ProtectedRoute>
              } 
            />
          </Route>
          <Route path="/sign-in/*" element={<SignIn />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthWrapper>
  );
}

export default App;

