import { useState } from 'react';

interface ConfirmationState {
  visible: boolean;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  onConfirm: () => void;
  confirmText: string;
  cancelText: string;
}

export function useConfirmation() {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'warning' | 'danger' | 'info' | 'success' = 'warning',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setConfirmationState({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const hideConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, visible: false }));
  };

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation,
  };
}
