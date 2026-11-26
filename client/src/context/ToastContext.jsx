import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (type, message) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast]
  );

  const toast = {
    success: (msg) => pushToast('success', msg),
    error: (msg) => pushToast('error', msg),
    info: (msg) => pushToast('info', msg),
  };

  const confirm = useCallback(
    ({
      title = 'Xác nhận thao tác',
      message = 'Bạn có chắc muốn thực hiện hành động này?',
      confirmText = 'Xác nhận',
      cancelText = 'Hủy',
      danger = true,
    }) => {
      return new Promise((resolve) => {
        setConfirmState({
          title,
          message,
          confirmText,
          cancelText,
          danger,
          resolve,
        });
      });
    },
    []
  );

  const handleConfirmChoice = (accepted) => {
    if (confirmState) {
      confirmState.resolve(accepted);
      setConfirmState(null);
    }
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const styles = {
            success: 'bg-emerald-600 text-white border-emerald-500',
            error: 'bg-rose-600 text-white border-rose-500',
            info: 'bg-slate-900 text-white border-slate-700',
          }[t.type];

          const Icon =
            t.type === 'success'
              ? CheckCircle2
              : t.type === 'error'
              ? AlertCircle
              : Info;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all ${styles}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-75 hover:opacity-100 cursor-pointer shrink-0"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Global Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmState.danger
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmState.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmChoice(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer transition"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmChoice(true)}
                className={`px-4 py-2 rounded-xl text-white text-sm font-semibold cursor-pointer transition ${
                  confirmState.danger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
