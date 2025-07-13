import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface ServiceUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  serviceUser: ServiceUser | null;
  serviceAccessToken: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [serviceAccessToken, setServiceAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const callServiceLogin = async (accessToken: string) => {
    try {
      const response = await fetch('https://team-sync-pro-nguyentrieu8.replit.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken
        }),
      });

      if (!response.ok) {
        throw new Error('Service login failed');
      }

      const data = await response.json();
      setServiceUser(data.user);
      setServiceAccessToken(data.access_token);
    } catch (error) {
      console.error('Service login error:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Call service login API if we have a Google provider token
        if (session?.provider_token && event === 'SIGNED_IN') {
          setTimeout(() => {
            callServiceLogin(session.provider_token!);
          }, 0);
        } else if (!session) {
          // Clear service user data on sign out
          setServiceUser(null);
          setServiceAccessToken(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Call service login API if we have a Google provider token
      if (session?.provider_token) {
        callServiceLogin(session.provider_token);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setServiceUser(null);
    setServiceAccessToken(null);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    serviceUser,
    serviceAccessToken,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};