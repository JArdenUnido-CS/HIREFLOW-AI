import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  loading?: boolean;
  isDangerous?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
  isDangerous = false,
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl shadow-2xl max-w-sm w-full">
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${isDangerous ? 'border-danger-200 dark:border-danger-800' : 'border-surface-200 dark:border-surface-800'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDangerous ? 'bg-danger-50 dark:bg-danger-900/20' : 'bg-warning-50 dark:bg-warning-900/20'}`}>
                    {isDangerous ? (
                      <AlertTriangle size={20} className="text-danger-600 dark:text-danger-400" />
                    ) : (
                      <Trash2 size={20} className="text-warning-600 dark:text-warning-400" />
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-surface-900 dark:text-white">{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-200 dark:hover:bg-surface-800 rounded-lg transition-colors"
                >
                  <X size={20} className="text-surface-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">{message}</p>
                {isDangerous && (
                  <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 mb-4">
                    <p className="text-xs font-medium text-danger-700 dark:text-danger-300">
                      This action cannot be undone. Please confirm before proceeding.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 border-t border-surface-100 dark:border-surface-800">
                <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant={isDangerous ? 'danger' : 'secondary'} 
                  onClick={onConfirm} 
                  loading={loading}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
