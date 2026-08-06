import { InputProps } from '../Input/Input.types';

export interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  onClear?: () => void;
  clearLabel?: string;
}
