import { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
