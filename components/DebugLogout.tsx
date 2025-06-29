"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DebugLogout() {
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [logHistory, setLogHistory] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const router = useRouter()

    const addLog = (message: string) => {
        const timestamp = new Date().toISOString();
        setLogHistory(prev => [...prev, `${timestamp}: ${message}`]);
        console.log(`🔍 DEBUG: ${message}`);
    };

    const checkStorage = () => {
        const info = {
            timestamp: new Date().toISOString(),
            localStorage: {
                auth_user: localStorage.getItem('auth_user'),
                auth_token: localStorage.getItem('auth_token'),
                allKeys: Object.keys(localStorage),
                length: localStorage.length
            },
            sessionStorage: {
                allKeys: Object.keys(sessionStorage),
                length: sessionStorage.length
            },
            cookies: document.cookie,
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                VERCEL: process.env.VERCEL,
                NEXT_PUBLIC_VERCEL: process.env.NEXT_PUBLIC_VERCEL,
                userAgent: navigator.userAgent,
                platform: navigator.platform
            }
        };

        setDebugInfo(info);
        addLog(`Storage checked: ${JSON.stringify(info.localStorage.allKeys)}`);
        return info;
    };

    const checkAuthUserContent = () => {
        addLog('=== Checking auth_user content ===');

        const authUser = localStorage.getItem('auth_user');

        if (authUser) {
            addLog(`auth_user length: ${authUser.length} chars`);
            addLog(`auth_user preview: ${authUser.substring(0, 100)}...`);

            try {
                const parsed = JSON.parse(authUser);
                addLog(`auth_user parsed: ${JSON.stringify(parsed, null, 2)}`);
                addLog(`auth_user keys: ${Object.keys(parsed).join(', ')}`);
            } catch (e) {
                addLog(`auth_user is not valid JSON: ${e}`);
            }

            // Попробуем удалить через eval (крайний метод)
            try {
                eval(`delete window.localStorage['auth_user']`);
                addLog('Tried eval delete');
            } catch (e) {
                addLog(`Eval delete failed: ${e}`);
            }

            // Проверим, есть ли геттер/сеттер
            const descriptor = Object.getOwnPropertyDescriptor(window.localStorage, 'auth_user');
            if (descriptor) {
                addLog(`auth_user descriptor: ${JSON.stringify(descriptor)}`);
            }
        }

        // Проверим прототип localStorage
        addLog(`localStorage prototype: ${Object.getPrototypeOf(localStorage).constructor.name}`);

        // Проверим, переопределен ли localStorage
        addLog(`localStorage === window.localStorage: ${localStorage === window.localStorage}`);

        // Попробуем создать новый Storage
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const iframeStorage = iframe.contentWindow?.localStorage;
            if (iframeStorage) {
                addLog(`iframe localStorage auth_user: ${iframeStorage.getItem('auth_user') ? 'EXISTS' : 'NULL'}`);

                // Попробуем удалить через iframe
                iframeStorage.removeItem('auth_user');
                addLog('Tried removal via iframe localStorage');
            }

            document.body.removeChild(iframe);
        } catch (e) {
            addLog(`iframe test failed: ${e}`);
        }
    };

    const testClearMethods = async () => {
        addLog('Starting clear methods test...');

        // Test 1: Direct removeItem
        addLog('Test 1: Direct removeItem');
        try {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            addLog('✅ Direct removeItem completed');
        } catch (e) {
            addLog(`❌ Direct removeItem failed: ${e}`);
        }

        await new Promise(r => setTimeout(r, 100));
        checkStorage();

        // Test 2: Set empty then remove
        addLog('Test 2: Set empty then remove');
        try {
            localStorage.setItem('auth_user', '');
            localStorage.setItem('auth_token', '');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            addLog('✅ Set empty then remove completed');
        } catch (e) {
            addLog(`❌ Set empty then remove failed: ${e}`);
        }

        await new Promise(r => setTimeout(r, 100));
        checkStorage();

        // Test 3: Delete property
        addLog('Test 3: Delete property');
        try {
            delete (localStorage as any)['auth_user'];
            delete (localStorage as any)['auth_token'];
            addLog('✅ Delete property completed');
        } catch (e) {
            addLog(`❌ Delete property failed: ${e}`);
        }

        await new Promise(r => setTimeout(r, 100));
        checkStorage();

        // Test 4: Clear all
        addLog('Test 4: Clear all');
        try {
            localStorage.clear();
            addLog('✅ Clear all completed');
        } catch (e) {
            addLog(`❌ Clear all failed: ${e}`);
        }

        await new Promise(r => setTimeout(r, 100));
        checkStorage();

        // Test 5: Iterate and remove
        addLog('Test 5: Iterate and remove');
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('auth') || key.includes('user') || key.includes('token')) {
                    localStorage.removeItem(key);
                }
            });
            addLog('✅ Iterate and remove completed');
        } catch (e) {
            addLog(`❌ Iterate and remove failed: ${e}`);
        }

        await new Promise(r => setTimeout(r, 100));
        const finalCheck = checkStorage();

        addLog(`Final check - auth_user exists: ${!!finalCheck.localStorage.auth_user}`);
        addLog(`Final check - auth_token exists: ${!!finalCheck.localStorage.auth_token}`);
    };

    const testSetAndGet = () => {
        addLog('Testing set and get...');

        try {
            // Set test value
            localStorage.setItem('test_key', 'test_value');
            const getValue = localStorage.getItem('test_key');
            addLog(`Set/Get test: ${getValue === 'test_value' ? '✅ Works' : '❌ Failed'}`);

            // Remove test value
            localStorage.removeItem('test_key');
            const afterRemove = localStorage.getItem('test_key');
            addLog(`Remove test: ${afterRemove === null ? '✅ Works' : '❌ Failed'}`);
        } catch (e) {
            addLog(`❌ Set/Get test error: ${e}`);
        }
    };

    const testServerSide = async () => {
        addLog('Testing server-side...');

        try {
            const response = await fetch('/api/debug/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check' })
            });

            const data = await response.json();
            addLog(`Server response: ${JSON.stringify(data)}`);
        } catch (e) {
            addLog(`Server test failed: ${e}`);
        }
    };

    const checkReactMounting = () => {
        addLog('=== Checking React Mounting ===');

        // Проверим, сколько раз монтируется AuthProvider
        const authProviderCount = document.querySelectorAll('[data-auth-provider]').length;
        addLog(`AuthProvider instances: ${authProviderCount}`);

        // Проверим React DevTools
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            addLog('React DevTools detected');
        }

        // Проверим, есть ли дублирование в дереве компонентов
        const reactFiber = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1);
        if (reactFiber) {
            addLog(`React Fiber found: ${!!reactFiber}`);
        }
    };

    const forceClearWithSW = async () => {
        addLog('=== FORCE CLEAR WITH SW UNREGISTER ===');

        // 1. Unregister все Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
                addLog(`Unregistered SW: ${registration.scope}`);
            }
        }

        // 2. Очистить все кэши
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                await caches.delete(name);
                addLog(`Deleted cache: ${name}`);
            }
        }

        // 3. Очистить localStorage
        localStorage.clear();
        sessionStorage.clear();

        // 4. Перезагрузить страницу
        setTimeout(() => {
            router.push("/")
        }, 500);
    };

    const checkServiceWorker = async () => {
        addLog('=== Checking Service Worker ===');

        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            addLog(`Active SW registrations: ${registrations.length}`);

            registrations.forEach((reg, i) => {
                addLog(`SW ${i}: ${reg.scope}, active: ${reg.active?.state}, waiting: ${reg.waiting?.state}`);
            });

            // Попробуем unregister все SW
            try {
                for (const reg of registrations) {
                    await reg.unregister();
                    addLog(`Unregistered SW: ${reg.scope}`);
                }
            } catch (e) {
                addLog(`SW unregister failed: ${e}`);
            }
        }

        // Проверим кэши
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                addLog(`Active caches: ${cacheNames.join(', ')}`);

                // Удалим все кэши
                for (const name of cacheNames) {
                    await caches.delete(name);
                    addLog(`Deleted cache: ${name}`);
                }
            } catch (e) {
                addLog(`Cache check failed: ${e}`);
            }
        }
    };

    const checkStorageEvents = () => {
        addLog('Setting up storage event listener...');

        window.addEventListener('storage', (e) => {
            addLog(`Storage event: key=${e.key}, oldValue=${e.oldValue}, newValue=${e.newValue}`);
        });

        // Test storage event
        localStorage.setItem('event_test', 'value1');
        setTimeout(() => {
            localStorage.setItem('event_test', 'value2');
        }, 100);
        setTimeout(() => {
            localStorage.removeItem('event_test');
        }, 200);
    };

    const forceReload = () => {
        addLog('Forcing page reload...');
        window.location.reload();
    };

    useEffect(() => {
        checkStorage();

        // Monitor storage changes
        const interval = setInterval(() => {
            const authUser = localStorage.getItem('auth_user');
            const authToken = localStorage.getItem('auth_token');

            if (authUser || authToken) {
                addLog(`⚠️ Auth data detected: user=${!!authUser}, token=${!!authToken}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Перехватываем setItem для отладки
        const originalSetItem = localStorage.setItem;
        
        localStorage.setItem = function(key: string, value: string) {
            console.log(`🔴 localStorage.setItem called:`, {
                key,
                value: value?.substring(0, 100) + '...',
                stackTrace: new Error().stack
            });
            
            // Добавляем в лог
            if (key === 'auth_user' || key === 'auth_token') {
                addLog(`⚠️ WRITE to ${key}: ${value?.substring(0, 50)}...`);
            }
            
            // Вызываем оригинальный метод
            return originalSetItem.apply(localStorage, [key, value]);
        };
        
        // Cleanup
        return () => {
            localStorage.setItem = originalSetItem;
        };
    }, []);

    return (
        <>
            {/* Кнопка для развернутого состояния */}
            {isCollapsed && (
                <Button
                    size="sm"
                    onClick={() => setIsCollapsed(false)}
                    className="fixed bottom-4 left-4 z-50 bg-gradient-to-r from-blue-500 to-indigo-500 hover:bg-blue-600 hover:to-indigo-600 shadow-lg"
                >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Debug Panel
                </Button>
            )}

            {/* Основная панель */}
            <Card 
                className={`fixed bottom-4 left-4 w-96 max-h-[600px] overflow-hidden z-50 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'translate-y-[calc(100%+1rem)] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                }`}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🔍 Logout Debug Panel</CardTitle>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsCollapsed(true)}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={checkAuthUserContent}>Check auth_user</Button>
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={checkServiceWorker}>Check SW</Button>
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={checkReactMounting}>Check React</Button>
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={checkStorage}>Check Storage</Button>
                        <Button className="bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 border-none" size="sm" onClick={forceClearWithSW} >
                            Force Clear + Reload
                        </Button>
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={testClearMethods}>Test Clear</Button>
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={testSetAndGet}>Test Set/Get</Button>
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={checkStorageEvents}>Test Events</Button>
                        <Button className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' size="sm" onClick={forceReload}>Reload Page</Button>
                    </div>

                    <div className="text-xs space-y-1">
                        <div className="font-bold">Current State:</div>
                        <div>auth_user: {debugInfo.localStorage?.auth_user ? '✅ EXISTS' : '❌ NULL'}</div>
                        <div>auth_token: {debugInfo.localStorage?.auth_token ? '✅ EXISTS' : '❌ NULL'}</div>
                        <div>localStorage keys: {debugInfo.localStorage?.length || 0}</div>
                        <div>Environment: {debugInfo.environment?.NODE_ENV}</div>
                        <div>Vercel: {debugInfo.environment?.VERCEL || 'false'}</div>
                    </div>

                    <div className="text-xs space-y-1 max-h-[200px] overflow-y-auto">
                        <div className="font-bold">Log History:</div>
                        {logHistory.map((log, i) => (
                            <div key={i} className="font-mono text-[10px]">{log}</div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}