import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Teams from "./pages/Teams";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      {/* Header - visible on all pages */}
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
                              <span className="text-sm text-muted-foreground hidden sm:inline">
                                {/* User email will be shown here */}
                              </span>
                              <Button variant="ghost" size="sm">
                                <Bell className="h-5 w-5" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-5 w-5" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <LogOut className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </header>

                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/projects" element={<Projects />} />
                          <Route path="/teams" element={<Teams />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
