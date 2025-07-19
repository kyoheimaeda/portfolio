'use client';

import React, { useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import styles from './index.module.scss';
import { LuX } from "react-icons/lu";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode; // メッセージはJSXも受け取れるように
  onConfirm?: () => void; // オプションにする
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean; // 処理中かどうか
};

export default function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'はい',
  cancelText = 'キャンセル',
  isProcessing = false,
}: DialogProps) {
  const showActionButtons = onConfirm !== undefined; // onConfirm が提供されている場合のみボタンを表示

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onEsc);
    } else {
      document.removeEventListener('keydown', onEsc);
    }
    return () => document.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dialog-overlay"
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            key="dialog-content"
            className={styles.dialogContent} // Modal の .modal に相当
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2>{title}</h2>
            <div className={styles.dialogMessage}> {/* ConfirmModal の .confirmModalContent に相当 */}
              {message}
            </div>
            {showActionButtons && (
              <div className={styles.dialogActions}> {/* ConfirmModal の .confirmModalActions に相当 */}
                <button className={`c-button`} onClick={onConfirm} disabled={isProcessing}>{confirmText}</button>
                <button className={`c-button outline`} onClick={onClose} disabled={isProcessing}>{cancelText}</button>
              </div>
            )}
            <button className={styles.close} onClick={onClose}>
              <LuX />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
