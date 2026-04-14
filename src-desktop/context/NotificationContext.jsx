import React, { createContext, useState, useCallback} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext();

/**
 * Renders a fixed-position stack of notifications and allows dismissing them.
 *
 * Renders each notification with type-specific icon and styling, animates its entry/exit, and calls `onRemove(id)` when a notification is clicked.
 *
 * @param {Object} props
 * @param {Array<{id: number|string, message: string, type?: string}>} props.notifications - Array of notifications to display; each item must include `id` and `message`, `type` is optional and controls styling (`'success' | 'error' | 'warning' | 'info'`).
 * @param {(id: number|string) => void} props.onRemove - Callback invoked with a notification `id` to remove that notification.
 */
function NotificationStack({ notifications, onRemove }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} className="text-emerald-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-amber-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[9999] space-y-2 pointer-events-none md:left-auto md:right-6 md:max-w-sm">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border pointer-events-auto cursor-pointer ${getStyles(notification.type)} shadow-lg`}
            onClick={() => onRemove(notification.id)}
          >
            {getIcon(notification.type)}
            <span className="text-sm font-medium flex-1">{notification.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Provides notification state and APIs to descendants; renders children and a visual notification stack.
 *
 * The provider manages an internal list of notifications and exposes functions via context:
 * `addNotification(message, type = 'info', duration = 3000)` — adds a notification and returns its generated id;
 * `removeNotification(id)` — removes the notification with the given id;
 * `showSuccess(message)`, `showError(message)`, `showInfo(message)`, `showWarning(message)` — convenience helpers that add a notification with the corresponding type.
 * When `addNotification` is called with `duration > 0`, the notification is automatically removed after the specified duration.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Child elements that will have access to the notification context.
 * @returns {import('react').JSX.Element} The provider element that wraps children and renders the notification stack.
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message) => addNotification(message, 'success'), [addNotification]);
  const showError = useCallback((message) => addNotification(message, 'error'), [addNotification]);
  const showInfo = useCallback((message) => addNotification(message, 'info'), [addNotification]);
  const showWarning = useCallback((message) => addNotification(message, 'warning'), [addNotification]);

  return (
    <NotificationContext.Provider value={{
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}
      <NotificationStack notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}
