
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          try {
            // Fetch the user profile
            setTimeout(async () => {
              const { data, error } = await supabase
                .from('profiles')
                .select('id, username, email, wallet_balance')
                .eq('id', newSession.user.id)
                .single();
              
              if (error) throw error;
              
              if (data) {
                setUser({
                  id: data.id,
                  username: data.username,
                  email: data.email,
                  walletBalance: data.wallet_balance
                });
              }
            }, 0);
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, email, wallet_balance')
            .eq('id', currentSession.user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setUser({
              id: data.id,
              username: data.username,
              email: data.email,
              walletBalance: data.wallet_balance
            });
          }
        }
      } catch (e) {
        console.error("Error during auth initialization:", e);
        setError(e instanceof Error ? e.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google login failed');
      toast({
        title: 'Login Failed',
        description: e instanceof Error ? e.message : 'Google login failed',
        variant: 'destructive'
      });
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (e) {
      console.error("Error during logout:", e);
      setError(e instanceof Error ? e.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login: handleLogin,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
