import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { Contrast, Import, RotateCcw } from "lucide-react";

type NavItemProps = {
  children: React.ReactNode;
  active?: boolean;
};

function NavItem({ children, active }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={`px-4 py-2 text-sm rounded-none border-b-2 ${
        active 
          ? "border-primary text-foreground" 
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      }`}
    >
      {children}
    </Button>
  );
}

export function Navbar() {
  return (
    <div className="flex h-14 items-center border-b bg-background px-4 lg:px-6">
      <div className="flex gap-1 items-center ml-auto">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Contrast className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Import className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <RotateCcw className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <Button variant="outline" className="ml-2">
          Code
        </Button>
      </div>
    </div>
  );
}

export function TabsNav() {
  return (
    <div className="flex h-10 items-center border-b bg-background">
      <NavItem>Cards</NavItem>
      <NavItem>Mail</NavItem>
      <NavItem>Tasks</NavItem>
      <NavItem>Music</NavItem>
      <NavItem active>Dashboard</NavItem>
      <NavItem>Color Palette</NavItem>
    </div>
  );
} 