import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ErrorAlert } from '@/components/common';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  title: string;
  description: string;
  icon: ReactNode;
  form: any;
  onSubmit: (values: any) => Promise<void>;
  error: string | null;
  clearError: () => void;
  isLoading: boolean;
  submitText: string;
  loadingText: string;
  footerText: string;
  footerLinkText: string;
  footerLinkPath: string;
  children: ReactNode;
}

const AuthForm = ({
  title,
  description,
  icon,
  form,
  onSubmit,
  error,
  clearError,
  isLoading,
  submitText,
  loadingText,
  footerText,
  footerLinkText,
  footerLinkPath,
  children
}: AuthFormProps) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] animate-in fade-in-50 duration-500">
      <Card className="w-full max-w-md border-border/30 shadow-md transition-all duration-300">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">{title}</CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <ErrorAlert 
                message={error} 
                onClose={clearError} 
                duration={10000}
              />
              
              {children}
              
              <Button 
                type="submit" 
                className={cn(
                  "w-full font-medium transition-all duration-300 mt-2",
                  "bg-primary/90 hover:bg-primary",
                  "hover:shadow-md hover:shadow-primary/10",
                  isLoading && "opacity-90"
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>{loadingText}</span>
                  </span>
                ) : (
                  submitText
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {footerText}{' '}
            <Link to={footerLinkPath} className="text-primary font-medium hover:underline transition-colors duration-300">
              {footerLinkText}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm; 