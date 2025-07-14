import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function FixJWTButton() {
  const [isFixing, setIsFixing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const checkJWT = async () => {
    try {
      const response = await fetch('/api/debug/jwt');
      const data = await response.json();
      setDebugInfo(data);
      return data;
    } catch (error) {
      console.error('Error checking JWT:', error);
      return null;
    }
  };

  const fixJWT = async () => {
    setIsFixing(true);
    
    try {
      // Сначала проверяем текущее состояние
      const checkData = await checkJWT();
      console.log('Current JWT state:', checkData);
      
      // Исправляем JWT
      const response = await fetch('/api/auth/fix-jwt', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "JWT токен исправлен!",
          description: "Теперь Face ID и загрузка файлов должны работать",
          duration: 5000
        });
        
        // Проверяем новое состояние
        setTimeout(async () => {
          const newCheckData = await checkJWT();
          console.log('New JWT state:', newCheckData);
        }, 1000);
        
      } else {
        throw new Error(data.error || 'Не удалось исправить JWT');
      }
      
    } catch (error) {
      console.error('Error fixing JWT:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось исправить JWT"
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <Button
        onClick={fixJWT}
        disabled={isFixing}
        variant="default"
        size="sm"
        className="shadow-lg"
      >
        {isFixing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Исправление JWT...
          </>
        ) : (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Исправить JWT
          </>
        )}
      </Button>
      
      {debugInfo && (
        <div className="bg-black/90 text-white p-3 rounded-lg max-w-sm text-xs space-y-1">
          <div>Role: {debugInfo.cookies?.userRole}</div>
          <div>Token: {debugInfo.token?.exists ? '✓' : '✗'}</div>
          <div>JWT Secret: {debugInfo.environment?.hasJwtSecret ? '✓' : '✗'}</div>
          {debugInfo.getSessionResult && (
            <div>Session: {debugInfo.getSessionResult.success ? '✓' : '✗'}</div>
          )}
        </div>
      )}
    </div>
  );
}