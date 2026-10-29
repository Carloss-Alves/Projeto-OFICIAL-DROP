import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

interface ToastContextValue {
  notify: (message: string, tone?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-24 lg:bottom-6 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm shadow-lift ${
              t.tone === 'success' ? 'bg-ink-800 text-bone-50 border border-signal-500/40' : 'bg-ink-800 text-bone-50 border border-sale-500/50'
            }`}
          >
            {t.tone === 'success' ? <CheckCircle2 size={16} className="text-signal-400" /> : <XCircle size={16} className="text-sale-500" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
