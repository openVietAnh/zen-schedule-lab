import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const Join = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { serviceUser } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const teamId = searchParams.get("team_id");
  const role = searchParams.get("role");

  useEffect(() => {
    if (serviceUser?.id && teamId && role) {
      setShowModal(true);
      joinTeam();
    }
  }, [serviceUser, teamId, role]);

  const joinTeam = async () => {
    if (!serviceUser?.id || !teamId || !role) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://team-sync-pro-nguyentrieu8.replit.app/teams/${teamId}/join?user_id=${serviceUser.id}&role=${role}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "You have been successfully added to the team!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to join team. You might already be a member.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowModal(false);
    }
  };

  const handleLoginRedirect = () => {
    const currentUrl = window.location.pathname + window.location.search;
    navigate(`/auth?returnUrl=${encodeURIComponent(currentUrl)}`);
  };

  if (!teamId || !role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Invalid Invitation Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              This invitation link is missing required parameters. Please check the link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!serviceUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Team Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Please log in to accept your team invitation.
          </p>
          <Button 
            onClick={handleLoginRedirect}
            className="w-full"
          >
            Log In
          </Button>
        </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Welcome to the Team!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You have been invited to join a team as a <strong>{role}</strong>.
          </p>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adding you to the team...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span className="text-sm text-muted-foreground">Processing your invitation...</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Join;