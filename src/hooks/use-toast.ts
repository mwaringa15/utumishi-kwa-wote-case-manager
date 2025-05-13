
import { useState, useEffect } from "react";

// Type for toast properties
type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Type for toast API
type ToastAPI = {
  toast: (props: ToastProps) => void;
  dismiss: (id?: string) => void;
};

// Export an empty toast function for direct imports
export const toast = (props: ToastProps) => {
  // This will be overridden by the actual implementation
  console.log("Toast called without context:", props);
};

// Custom hook to provide toast functionality
export const useToast = (): ToastAPI => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Function to show a toast
  const showToast = (props: ToastProps) => {
    setToasts((prev) => [...prev, props]);
  };

  // Function to dismiss a toast
  const dismissToast = (id?: string) => {
    // If implemented with IDs later
    setToasts([]);
  };

  return {
    toast: showToast,
    dismiss: dismissToast,
  };
};
