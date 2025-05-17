
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface LoginForm {
  username: string;
  password: string;
}

const Login = () => {
  const { login, loginWithGoogle, isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back to SatStreet!',
      });
      navigate('/');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: 'Login Successful',
        description: 'Welcome to SatStreet!',
      });
      navigate('/');
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-satstreet-medium p-8 rounded-lg border border-satstreet-light shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome to SatStreet</h1>
            <p className="text-muted-foreground">Login to access your wallet and shop with sats</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3 mb-6">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="satoshi"
                disabled={isLoading}
                {...register('username', { required: 'Username is required' })}
                className="bg-satstreet-light border-satstreet-light"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('password', { required: 'Password is required' })}
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
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-satstreet-light" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-satstreet-medium px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              className="w-5 h-5 mr-2"
            />
            {isGoogleLoading ? 'Logging in...' : 'Login with Google'}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a className="text-bitcoin hover:text-bitcoin-dark cursor-pointer">
              Sign up
            </a>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
