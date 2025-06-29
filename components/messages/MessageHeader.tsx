// components/messages/MessageHeader.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface MessageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack
}) => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded-lg"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MessageHeader;