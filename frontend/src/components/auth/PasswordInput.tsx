import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { FormControl } from '@/components/ui/form';

interface PasswordInputProps {
  field: any;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

const PasswordInput = ({ 
  field, 
  placeholder = "••••••••", 
  disabled = false 
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <FormControl>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          {...field}
          disabled={disabled}
          className="transition-all duration-300 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50"
        />
      </FormControl>
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
  );
};

export default PasswordInput; 