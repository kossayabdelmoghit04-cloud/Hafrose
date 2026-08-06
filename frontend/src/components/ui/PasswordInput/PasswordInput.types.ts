import { InputProps } from '../Input/Input.types';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}
