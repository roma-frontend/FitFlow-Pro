import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Volume2, VolumeX, Sparkles } from 'lucide-react';
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

// Simplified Voice Selector
const VoiceSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = memo(({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between space-x-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
      >
        <span>{value === 'Mary' ? '👩🏻 Женский' : '👨🏻 Мужской'}</span>
        <span className="text-xs">↓</span>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
          {[
            { value: 'Mary', label: '👩🏻 Женский' },
            { value: 'Peter', label: '👨🏻 Мужской' }
          ].map((option) => (
            <button
              key={option.value}
              className="w-full px-3 py-3 text-left hover:bg-blue-50 transition-colors"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option.label}</span>
                {value === option.value && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize with debounce
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    const resize = () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };
    
    resize();
  }, [value]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const handleVoiceTranscript = useCallback((transcript: string) => {
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
    <div className="p-4 sm:p-6">
      {/* Audio Controls - Simplified */}
      {audioConfig.enabled && (
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Озвучка ответов</span>
            </div>
            <VoiceSelector
              value={audioConfig.voice}
              onChange={changeVoice}
            />
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Задайте вопрос..."
            disabled={isTyping}
            rows={1}
            className={`overflow-clip w-full py-2 ps-4 pr-12 bg-white border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all resize-none text-gray-900 placeholder-gray-500 text-sm min-h-[40px] max-h-[120px] ${
              isFocused ? 'border-blue-300' : 'border-gray-200'
            } ${isTyping ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          
          {/* Voice Input Button */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              disabled={isTyping}
            />
          </div>
        </div>
        
        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={!value.trim() || isTyping}
          className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
        >
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          
          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <Send className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Audio Toggle Button */}
        <button
          onClick={toggleAudio}
          className={`w-10 h-10 rounded-3xl flex items-center justify-center transition-colors shadow-lg ${
            audioConfig.enabled
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          title={audioConfig.enabled ? 'Выключить озвучку' : 'Включить озвучку'}
        >
          {audioConfig.enabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Status Indicator - Simplified */}
      <div className="mt-4 flex items-center justify-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
        <span className="text-xs text-gray-500 font-medium">
          {isTyping ? 'AI обрабатывает...' : 'Готов к общению'}
        </span>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';