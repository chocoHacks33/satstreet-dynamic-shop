
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store } from 'lucide-react';
import { updateUserRole } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

interface RegisterForm {
  email: string;
  password: string;
  username: string;
}

const SellerRegister = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, check if they're already a seller
  if (isAuthenticated && user?.role === 'seller') {
    navigate('/seller');
    return null;
  }

  // Handle authenticated user who wants to become a seller
  if (isAuthenticated) {
    const handleBecomeASeller = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const success = await updateUserRole(user!.id, 'seller');
        
        if (success) {
          toast.success("You're now registered as a seller!");
          navigate('/seller');
        } else {
          setError("Failed to update your account to seller status. Please try again.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-satstreet-medium p-8 rounded-lg border border-satstreet-light shadow-lg">
            <div className="text-center mb-8">
              <Store className="h-12 w-12 mx-auto mb-2" />
              <h1 className="text-2xl font-bold mb-2">Become a Seller</h1>
              <p className="text-muted-foreground">Upgrade your account to start selling products on SatStreet</p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border border-red-500/50">
                <AlertDescription className="text-red-500">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mb-6">
              <p>
                You're already logged in as <strong>{user?.username}</strong>. 
                Upgrade your account to start selling on SatStreet!
              </p>
            </div>
            
            <Button
              onClick={handleBecomeASeller}
              className="w-full bg-bitcoin hover:bg-bitcoin-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : 'Become a Seller'}
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // For non-authenticated users, show registration form
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create account
      const { email, password } = data;
      
      // This will register a new user through Supabase
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: data.username,
          },
        }
      });

      // Now log them in
      await login(email, password);
      
      // Wait a moment for the session to be recognized
      setTimeout(async () => {
        // Update the user's role to seller
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          await updateUserRole(userId, 'seller');
          toast.success("You're now registered as a seller!");
          navigate('/seller');
        }
      }, 500);
      
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-satstreet-medium p-8 rounded-lg border border-satstreet-light shadow-lg">
          <div className="text-center mb-8">
            <Store className="h-12 w-12 mx-auto mb-2" />
            <h1 className="text-2xl font-bold mb-2">Seller Registration</h1>
            <p className="text-muted-foreground">Create an account to start selling on SatStreet</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border border-red-500/50">
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Your display name"
                disabled={isLoading}
                {...register('username', { required: 'Username is required' })}
                className="bg-satstreet-light border-satstreet-light"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seller@example.com"
                disabled={isLoading}
                {...register('email', { required: 'Email is required' })}
                className="bg-satstreet-light border-satstreet-light"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' } 
                })}
                className="bg-satstreet-light border-satstreet-light"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-bitcoin hover:bg-bitcoin-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : 'Register as Seller'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-bitcoin hover:text-bitcoin-dark"
              onClick={() => navigate('/login')}
            >
              Log in
            </Button>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SellerRegister;
