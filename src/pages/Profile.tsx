import { User, Mail, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { user, serviceUser } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {serviceUser?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {serviceUser?.full_name || "Anonymous User"}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{serviceUser?.email || user?.email}</span>
                </div>
                {serviceUser?.username && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>@{serviceUser.username}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Account Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>User ID: {serviceUser?.id}</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Joined: {new Date(user?.created_at || "").toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Preferences</h4>
                <div className="text-sm text-muted-foreground">
                  <div>Email verified: {user?.email_confirmed_at ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;