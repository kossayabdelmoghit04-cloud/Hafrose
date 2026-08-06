import {  forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PasswordInputProps } from './PasswordInput.types';
import { Input } from '../Input';
import { IconButton } from '../IconButton';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showPasswordLabel = 'Afficher le mot de passe',
      hidePasswordLabel = 'Masquer le mot de passe',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            icon={showPassword ? <EyeOff className="w-4 h-4 text-neutral-500" /> : <Eye className="w-4 h-4 text-neutral-500" />}
          />
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
