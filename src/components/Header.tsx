import { useAuth } from "@/hooks/useAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  const { serviceUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleEmailClick = () => {
    navigate("/profile");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                Zen Schedule
              </h1>
              <p className="text-xs text-muted-foreground">
                Mindful Productivity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm text-muted-foreground hidden sm:inline-flex hover:text-primary"
              onClick={handleEmailClick}
            >
              {serviceUser?.email}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};