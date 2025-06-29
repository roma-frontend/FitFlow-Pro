// components/ValidatedInput.tsx (продолжение)
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface ValidatedInputProps {
  type: 'text' | 'email' | 'password';
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  className?: string;
  showPasswordToggle?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  showPasswordToggle = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative">
      <Input
        type={inputType}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${className} ${showPasswordToggle ? 'pr-10' : ''}`}
      />
      
      {showPasswordToggle && type === 'password' && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
    </div>
  );
};
