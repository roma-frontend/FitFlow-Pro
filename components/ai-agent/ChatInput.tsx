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

// Premium Voice Selector with smooth animations
const VoiceSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = memo(({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 rounded-2xl flex items-center justify-between space-x-2 text-sm font-medium text-purple-700 hover:from-purple-500/20 hover:to-pink-500/20 transition-all backdrop-blur-sm"
      >
        <span>{value === 'Mary' ? '👩🏻 Женский' : '👨🏻 Мужской'}</span>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-xs"
        >
          ↓
        </motion.span>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full mb-2 w-full bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl z-20 overflow-hidden"
          >
            {[
              { value: 'Mary', label: '👩🏻 Женский', desc: 'Мягкий голос' },
              { value: 'Peter', label: '👨🏻 Мужской', desc: 'Уверенный голос' }
            ].map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full px-3 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
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
    if (!audioConfig.enabled) {
      setShowVoiceSelector(true);
      setTimeout(() => setShowVoiceSelector(false), 3000);
    }
  }, [audioConfig, onAudioConfigChange]);

  const changeVoice = useCallback((voice: string) => {
    onAudioConfigChange({
      ...audioConfig,
      voice: voice as 'Mary' | 'Peter'
    });
  }, [audioConfig, onAudioConfigChange]);

  return (
    <div className="p-4 sm:p-6">
      {/* Audio Controls - Show when enabled */}
      <AnimatePresence>
        {(audioConfig.enabled || showVoiceSelector) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl border border-purple-100/50">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Озвучка ответов</span>
              </div>
              <VoiceSelector
                value={audioConfig.voice}
                onChange={changeVoice}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <motion.div
            animate={{
              scale: isFocused ? 1.02 : 1,
              boxShadow: isFocused 
                ? '0 8px 32px rgba(99, 102, 241, 0.15)' 
                : '0 4px 16px rgba(0, 0, 0, 0.05)'
            }}
            className="relative rounded-3xl"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Задайте вопрос..."
              disabled={isTyping}
              rows={1}
              className="w-full py-2 px-4 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all resize-none text-gray-900 placeholder-gray-500 text-base leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
            />
            
            {/* Voice Input Button */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                disabled={isTyping}
              />
            </div>

            {/* Gradient overlay for premium look */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
          </motion.div>
        </div>
        
        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={!value.trim() || isTyping}
          className="w-10 h-10 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white rounded-3xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
              >
                <Send className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Audio Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAudio}
          className={`w-10 h-10 rounded-3xl flex items-center justify-center transition-all shadow-lg relative overflow-hidden group ${
            audioConfig.enabled
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-white/90 border border-gray-200/50 text-gray-600 hover:bg-gray-50'
          }`}
          title={audioConfig.enabled ? 'Выключить озвучку' : 'Включить озвучку'}
        >
          {/* Pulse effect when enabled */}
          {audioConfig.enabled && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-green-400 rounded-3xl"
            />
          )}
          
          <AnimatePresence mode="wait">
            {audioConfig.enabled ? (
              <motion.div
                key="volume-on"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Volume2 className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="volume-off"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <VolumeX className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex items-center justify-center space-x-3"
      >
        <motion.div
          className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs text-gray-500 font-medium">
          {isTyping ? 'AI обрабатывает запрос...' : 'Готов к общению • Powered by AI'}
        </span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-3 w-3 text-purple-500" />
        </motion.div>
      </motion.div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';