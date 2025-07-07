import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

// Extend Window interface for speech recognition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const windowWithSpeech = window as unknown as IWindow;
    const SpeechRecognitionConstructor = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognitionConstructor) {
      console.error('Speech recognition not supported');
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognitionConstructor() as SpeechRecognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'ru-RU'; // Russian language

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
      setTranscript('');
      setConfidence(0);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;

      // Собираем все результаты
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          bestConfidence = Math.max(bestConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      // Обновляем отображаемую транскрипцию
      setTranscript(interimTranscript);
      setConfidence(bestConfidence);
      
      // Если есть финальный результат, передаем его
      if (finalTranscript) {
        onTranscript(finalTranscript);
        setTranscript('');
        setConfidence(0);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      setTranscript('');
      setConfidence(0);
      
      // Show user-friendly error messages
      if (event.error === 'no-speech') {
        console.log('No speech detected');
      } else if (event.error === 'not-allowed') {
        // Create a premium notification
        showErrorNotification('Доступ к микрофону заблокирован. Разрешите доступ в настройках браузера.');
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      setTranscript('');
      setConfidence(0);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  // Premium error notification
  const showErrorNotification = (message: string) => {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      padding: 16px 24px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript('');
      setConfidence(0);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        disabled={disabled}
        className={`relative p-2 rounded-2xl transition-all duration-300 ${
          isListening 
            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25' 
            : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Остановить запись' : 'Начать запись'}
      >
        {/* Pulse rings when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-2xl">
            {[0, 0.5, 1].map((delay, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-2xl border-2 border-red-400"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.8, 0.4, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative z-10"
            >
              <MicOff className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative z-10"
            >
              <Mic className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Premium transcript preview */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 min-w-max max-w-xs"
          >
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-sm px-4 py-3 rounded-2xl shadow-xl backdrop-blur-sm border border-white/10 relative">
              {/* Speaking indicator */}
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                />
                <span className="text-xs font-medium text-gray-300">Слушаю...</span>
                <Volume2 className="h-3 w-3 text-gray-400" />
              </div>

              {/* Transcript text with typing effect */}
              <motion.p
                key={transcript}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm leading-relaxed"
              >
                {transcript}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-1 h-4 bg-white ml-1"
                />
              </motion.p>

              {/* Confidence indicator */}
              {confidence > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              )}

              {/* Speech bubble tail */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};