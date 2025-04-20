import { 
  ChevronDown, 
  LayoutDashboard, 
  LifeBuoy, 
  LineChart, 
  Folder, 
  Users, 
  PlusCircle, 
  Library, 
  FileText,
  Settings,
  Search,
  HelpCircle
} from "lucide-react";
import { Button } from "./ui/button";

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm">
          CN
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-sidebar-foreground">shadcn</h3>
          <p className="text-xs text-sidebar-foreground/70">me@example.com</p>
        </div>
        <Button variant="ghost" size="icon" className="text-sidebar-foreground">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="px-4 pt-6">
        <Button variant="secondary" className="w-full justify-start text-sm font-normal">
          <PlusCircle className="h-4 w-4 mr-2" />
          Quick Create
        </Button>
      </div>
      
      <nav className="flex-1 p-4 space-y-1.5">
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <LineChart className="h-4 w-4 mr-2" />
          Lifecycle
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <LineChart className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <Folder className="h-4 w-4 mr-2" />
          Projects
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <Users className="h-4 w-4 mr-2" />
          Team
        </Button>
        
        <div className="pt-4">
          <p className="text-xs font-medium text-sidebar-foreground/70 px-4 mb-2">Documents</p>
          <Button variant="ghost" className="w-full justify-start text-sm font-normal">
            <Library className="h-4 w-4 mr-2" />
            Data Library
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm font-normal">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm font-normal">
            <FileText className="h-4 w-4 mr-2" />
            Word Assistant
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm font-normal">
            <ChevronDown className="h-4 w-4 mr-2" />
            More
          </Button>
        </div>
      </nav>
      
      <div className="p-4 space-y-2 mt-auto border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <HelpCircle className="h-4 w-4 mr-2" />
          Get Help
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm font-normal">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
} 