import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Brain, History, User, LogOut, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Use separate selectors for each value - this is more stable
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Add scroll listener to apply shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a path is the current active route
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 bg-white dark:bg-[#1a1c2a] border-b border-border/30 transition-all duration-300",
        scrolled ? "shadow-md" : "shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          aria-label="CursorConnect Home"
        >
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Cursor</span>Connect
          </span>
        </Link>

        <nav className="flex items-center">
          {isAuthenticated ? (
            <div className="flex items-center space-x-8">
              <NavLink to="/" isActive={isActive("/")}>
                <Home className="h-4 w-4 mr-1.5" />
                <span className="font-medium">Home</span>
              </NavLink>
              
              <NavLink to="/history" isActive={isActive("/history")}>
                <History className="h-4 w-4 mr-1.5" />
                <span className="font-medium">History</span>
              </NavLink>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full border border-border hover:bg-accent/50 hover:scale-105 transition-all duration-200 ml-2"
                    aria-label="User menu"
                  >
                    <User className="h-4 w-4 text-primary/80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-1 shadow-md animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                  <div className="flex items-center justify-start gap-2 p-3">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user && (
                        <p className="font-semibold text-sm">
                          {user.username}
                        </p>
                      )}
                      {user && (
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer py-2 focus:bg-destructive/10 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                className="text-sm font-medium hover:bg-accent/50 transition-colors" 
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button 
                className="text-sm font-medium bg-primary/90 hover:bg-primary shadow-none hover:shadow-sm transition-all" 
                asChild
              >
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

// Custom NavLink component with active indicator and animations
const NavLink = ({ 
  to, 
  children, 
  isActive 
}: { 
  to: string; 
  children: React.ReactNode; 
  isActive: boolean;
}) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "relative flex items-center justify-center py-2 px-1 text-sm transition-all duration-300 hover:scale-105",
        isActive 
          ? "text-primary font-medium" 
          : "text-foreground/70 hover:text-foreground font-normal"
      )}
    >
      <div className="flex items-center justify-center">
        {children}
      </div>
      <span 
        className={cn(
          "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-all duration-300 ease-out",
          isActive 
            ? "opacity-100 scale-x-100" 
            : "opacity-0 scale-x-0 origin-center"
        )}
      />
    </Link>
  );
};

export default Navbar; 