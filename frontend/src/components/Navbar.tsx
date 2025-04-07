import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Brain, History, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Use separate selectors for each value - this is more stable
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-[#1a1c2a] shadow-sm border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-lg font-medium tracking-tight">CursorConnect</span>
        </Link>

        <nav>
          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors text-sm">
                Home
              </Link>
              <Link to="/history" className="flex items-center space-x-1.5 text-foreground/80 hover:text-foreground transition-colors text-sm">
                <History className="h-3.5 w-3.5" />
                <span>History</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border hover:bg-accent/50">
                    <User className="h-4 w-4 text-primary/80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-1 shadow-sm">
                  <div className="flex items-center justify-start gap-2 p-3">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user && (
                        <p className="font-medium text-sm">
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
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2 focus:bg-accent/50">
                    <LogOut className="h-4 w-4 mr-2 text-foreground/70" />
                    <span className="text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="text-sm font-normal hover:bg-accent/50" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="text-sm font-normal bg-primary/90 hover:bg-primary shadow-none" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 