import { 
  PlusCircle, 
  Library, 
  Settings,
  Link as LinkIcon,
  Home,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "./ui/theme-toggle";

interface LinkHub {
  username: string;
}

export function Sidebar() {
  const { user, userId, isSignedIn, signOut } = useAuth();
  const [userLinkHubs, setUserLinkHubs] = useState<LinkHub[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && userId) {
      fetchUserLinkHubs();
    }
  }, [isSignedIn, userId]);

  const fetchUserLinkHubs = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (data) {
        setUserLinkHubs(data as LinkHub[]);
      }
    } catch (error) {
      console.error('Error fetching user LinkHubs:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm">
          {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-sidebar-foreground">
            {user?.firstName || user?.username || "User"}
          </h3>
          <p className="text-xs text-sidebar-foreground/70">{user?.emailAddresses?.[0]?.emailAddress || ""}</p>
        </div>
      </div>
      
      <div className="px-4 pt-6">
        <Link to="/create-linkhub">
          <Button variant="secondary" className="w-full justify-start text-sm font-normal">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create LinkHub
          </Button>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start text-sm font-normal">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
        
        {isSignedIn && userLinkHubs.length > 0 && (
          <div className="pt-4">
            <p className="text-xs font-medium text-sidebar-foreground/70 px-4 mb-2">My LinkHubs</p>
            {userLinkHubs.map(hub => (
              <Link key={hub.username} to={`/profile/${hub.username}`}>
                <Button variant="ghost" className="w-full justify-start text-sm font-normal">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  @{hub.username}
                </Button>
              </Link>
            ))}
          </div>
        )}
        
        <div className="pt-4">
          <p className="text-xs font-medium text-sidebar-foreground/70 px-4 mb-2">Resources</p>
          <Link to="https://github.com/your-username/linkhub" target="_blank">
            <Button variant="ghost" className="w-full justify-start text-sm font-normal">
              <Library className="h-4 w-4 mr-2" />
              Documentation
            </Button>
          </Link>
        </div>
      </nav>
      
      <div className="p-4 space-y-2 mt-auto border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-sidebar-foreground/70">Theme</h3>
          <ThemeToggle />
        </div>
        
        {isSignedIn && (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm font-normal text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
} 