import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorAlert } from '@/components/common';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);
  const [showPassword, setShowPassword] = useState(false);

  // Clear error only when component mounts, not on every render
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password);
      // Only navigate if login was successful and there's no error
      const currentError = useAuthStore.getState().error;
      if (!currentError) {
        navigate('/');
      }
      // Do not automatically navigate if there's an error
    } catch (err) {
      // Error is handled in the store
      console.error('Login error:', err);
      // Don't navigate when there's an error
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Safely handle error dismiss
  const handleErrorDismiss = () => {
    clearError();
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] animate-in fade-in-50 duration-500">
      <Card className="w-full max-w-md border-border/30 shadow-md transition-all duration-300">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogIn className="h-5 w-5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ErrorAlert 
                message={error} 
                onClose={handleErrorDismiss} 
                duration={10000} // Extend to 10 seconds
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={isLoading}
                        className="transition-all duration-300 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                          className="transition-all duration-300 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-opacity duration-300"
                          onClick={togglePasswordVisibility}
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className={cn(
                  "w-full font-medium transition-all duration-300",
                  "bg-primary/90 hover:bg-primary",
                  "hover:shadow-md hover:shadow-primary/10",
                  isLoading && "opacity-90"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline transition-colors duration-300">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
