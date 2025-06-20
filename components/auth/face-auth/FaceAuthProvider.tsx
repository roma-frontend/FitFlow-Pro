// components/face-auth/FaceAuthProvider.tsx - ИСПРАВЛЕННАЯ версия
"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  FaceAuthMode, 
  FaceDetectionData, 
  AuthStatusType,
  BoundingBox,
  Landmark 
} from '@/types/face-auth.types';

interface FaceDetection {
  detected: boolean;
  boundingBox: BoundingBox | null;
  landmarks: Landmark[];
  quality: {
    lighting: number;
    stability: number;
    clarity: number;
  };
}

interface ScanProgress {
  stage: 'initializing' | 'detecting' | 'analyzing' | 'processing' | 'complete' | 'failed';
  progress: number;
  countdown: number;
}

interface FaceAuthState {
  isScanning: boolean;
  isRegistering: boolean;
  authStatus: AuthStatusType;
  faceDetection: FaceDetection;
  scanProgress: ScanProgress;
  scanCount: number;
  lastScanTime: Date | null;
  showDebugInfo: boolean;
  faceData: FaceDetectionData | null;
  sessionId: string;
  cameraActive: boolean; // 🔥 ДОБАВЛЕНО
}

type FaceAuthAction =
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'SET_REGISTERING'; payload: boolean }
  | { type: 'SET_AUTH_STATUS'; payload: AuthStatusType }
  | { type: 'SET_FACE_DETECTION'; payload: FaceDetection }
  | { type: 'SET_SCAN_PROGRESS'; payload: ScanProgress }
  | { type: 'SET_FACE_DATA'; payload: FaceDetectionData | null }
  | { type: 'INCREMENT_SCAN_COUNT' }
  | { type: 'SET_LAST_SCAN_TIME'; payload: Date | null }
  | { type: 'TOGGLE_DEBUG_INFO' }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_CAMERA_STATUS'; payload: boolean }; // 🔥 ДОБАВЛЕНО

const FaceAuthContext = createContext<{
  state: FaceAuthState;
  dispatch: React.Dispatch<FaceAuthAction>;
  actions: {
    startScanning: () => void;
    stopScanning: () => void;
    setRegistering: (value: boolean) => void;
    setAuthStatus: (status: AuthStatusType) => void;
    setFaceDetection: (detection: FaceDetection) => void;
    setFaceData: (data: FaceDetectionData | null) => void;
    setCameraStatus: (isActive: boolean) => void; // 🔥 ДОБАВЛЕНО
    toggleDebugInfo: () => void; // 🔥 ДОБАВЛЕНО
  };
} | null>(null);

const initialState: FaceAuthState = {
  isScanning: false,
  isRegistering: false,
  authStatus: null,
  faceDetection: {
    detected: false,
    boundingBox: null,
    landmarks: [],
    quality: { lighting: 0, stability: 0, clarity: 0 }
  },
  scanProgress: {
    stage: 'initializing',
    progress: 0,
    countdown: 3
  },
  scanCount: 0,
  lastScanTime: null,
  showDebugInfo: true, // 🔥 ИЗМЕНЕНО: включаем по умолчанию для отладки
  faceData: null,
  sessionId: Math.random().toString(36).substr(2, 9),
  cameraActive: false // 🔥 ДОБАВЛЕНО
};

function faceAuthReducer(state: FaceAuthState, action: FaceAuthAction): FaceAuthState {
  switch (action.type) {
    case 'SET_SCANNING':
      return { ...state, isScanning: action.payload };
    case 'SET_REGISTERING':
      return { ...state, isRegistering: action.payload };
    case 'SET_AUTH_STATUS':
      return { ...state, authStatus: action.payload };
    case 'SET_FACE_DETECTION':
      return { ...state, faceDetection: action.payload };
    case 'SET_SCAN_PROGRESS':
      return { ...state, scanProgress: action.payload };
    case 'SET_FACE_DATA':
      return { ...state, faceData: action.payload };
    case 'INCREMENT_SCAN_COUNT':
      return { ...state, scanCount: state.scanCount + 1 };
    case 'SET_LAST_SCAN_TIME':
      return { ...state, lastScanTime: action.payload };
    case 'TOGGLE_DEBUG_INFO':
      return { ...state, showDebugInfo: !state.showDebugInfo };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_CAMERA_STATUS': // 🔥 ДОБАВЛЕНО
      return { ...state, cameraActive: action.payload };
    default:
      return state;
  }
}

export function FaceAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(faceAuthReducer, initialState);

  const actions = {
    startScanning: useCallback(() => dispatch({ type: 'SET_SCANNING', payload: true }), []),
    stopScanning: useCallback(() => dispatch({ type: 'SET_SCANNING', payload: false }), []),
    setRegistering: useCallback((value: boolean) => dispatch({ type: 'SET_REGISTERING', payload: value }), []),
    setAuthStatus: useCallback((status: AuthStatusType) => dispatch({ type: 'SET_AUTH_STATUS', payload: status }), []),
    setFaceDetection: useCallback((detection: FaceDetection) => dispatch({ type: 'SET_FACE_DETECTION', payload: detection }), []),
    setFaceData: useCallback((data: FaceDetectionData | null) => dispatch({ type: 'SET_FACE_DATA', payload: data }), []),
    setCameraStatus: useCallback((isActive: boolean) => dispatch({ type: 'SET_CAMERA_STATUS', payload: isActive }), []), // 🔥 ДОБАВЛЕНО
    toggleDebugInfo: useCallback(() => dispatch({ type: 'TOGGLE_DEBUG_INFO' }), []), // 🔥 ДОБАВЛЕНО
  };

  return (
    <FaceAuthContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </FaceAuthContext.Provider>
  );
}

export const useFaceAuthContext = () => {
  const context = useContext(FaceAuthContext);
  if (!context) {
    throw new Error('useFaceAuthContext must be used within FaceAuthProvider');
  }
  return context;
};
