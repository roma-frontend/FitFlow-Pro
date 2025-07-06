import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Volume2 } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import type { AudioConfig } from './types';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceTranscript: (text: string) => void;
  isTyping: boolean;
  audioConfig: AudioConfig;
  onAudioConfigChange: (config: AudioConfig) => void;
}

// Voice selector component
const VoiceSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = memo(({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 h-8 px-2 text-xs border rounded flex items-center justify-between"
      >
        {value === 'Mary' ? 'Женский' : 'Мужской'}
        <span className={`ml-1 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>›</span>
      </button>
      {isOpen && (
        <div className="absolute bottom-full mb-1 w-full bg-white border rounded shadow-lg z-10">
          <button
            className="w-full px-2 py-1 text-xs text-left hover:bg-gray-100"
            onClick={() => {
              onChange('Mary');
              setIsOpen(false);
            }}
          >
            Женский
          </button>
          <button
            className="w-full px-2 py-1 text-xs text-left hover:bg-gray-100"
            onClick={() => {
              onChange('Peter');
              setIsOpen(false);
            }}
          >
            Мужской
          </button>
        </div>
      )}
    </div>
  );
});

VoiceSelector.displayName = 'VoiceSelector';

export const ChatInput: React.FC<ChatInputProps> = memo(({
  value,
  onChange,
  onSend,
  onVoiceTranscript,
  isTyping,
  audioConfig,
  onAudioConfigChange
}) => {
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  // Исправленная функция для обработки голосового ввода
  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Добавляем пробел перед новым текстом только если в поле уже есть текст
    const newText = value ? `${value} ${transcript}` : transcript;
    onChange(newText);
    onVoiceTranscript(transcript);
  }, [value, onChange, onVoiceTranscript]);

  const toggleAudio = useCallback(() => {
    onAudioConfigChange({
      ...audioConfig,
      enabled: !audioConfig.enabled
    });
  }, [audioConfig, onAudioConfigChange]);

  const changeVoice = useCallback((voice: string) => {
    onAudioConfigChange({
      ...audioConfig,
      voice: voice as 'Mary' | 'Peter'
    });
  }, [audioConfig, onAudioConfigChange]);

  return (
    <div className="p-4 border-t bg-gray-50 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Задайте вопрос..."
            className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isTyping}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              disabled={isTyping}
            />
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={!value.trim() || isTyping}
          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          {isTyping ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </motion.button>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAudio}
            className={`p-2 rounded-full flex items-center justify-center transition-all ${
              audioConfig.enabled
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-500'
            }`}
            title={audioConfig.enabled ? 'Выключить озвучку' : 'Включить озвучку'}
          >
            <Volume2 className="h-4 w-4" />
          </motion.button>

          {audioConfig.enabled && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <VoiceSelector
                value={audioConfig.voice}
                onChange={changeVoice}
              />
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-500">
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span>Онлайн • Powered by AI</span>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';