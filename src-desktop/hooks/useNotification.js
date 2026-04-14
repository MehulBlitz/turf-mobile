import React from 'react';
import { NotificationContext } from './NotificationContext';

/**
 * Access the current NotificationContext value and ensure the hook is used within its provider.
 *
 * @returns {any} The current notification context object.
 * @throws {Error} If called outside a NotificationProvider (message: "useNotification must be used within NotificationProvider").
 */
export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
