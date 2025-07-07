// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Что-то пошло не так!
            </h2>
            <p className="text-gray-600 mb-6">
              Произошла непредвиденная ошибка. Мы уже работаем над её устранением.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}