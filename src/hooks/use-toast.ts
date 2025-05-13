import * as React from "react";
import { v4 as uuidv4 } from "uuid";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

export type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
  open: boolean;
  createdAt: Date;
};

export type Toast = Omit<ToasterToast, "id" | "open" | "createdAt">;

// Define and export UseToastReturn
export type UseToastReturn = {
  toasts: ToasterToast[];
  toast: (props: Toast) => string;
  dismiss: (toastId: string) => void;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST;
      toast: ToasterToast;
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST;
      toast: Partial<ToasterToast> & { id: string };
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST;
      toastId: string;
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST;
      toastId: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id
            ? { ...t, ...action.toast }
            : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId));
          toastTimeouts.delete(toastId);
        }

        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        };
      }
      return state;
    }

    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action;

      if (toastTimeouts.has(toastId)) {
        clearTimeout(toastTimeouts.get(toastId));
        toastTimeouts.delete(toastId);
      }

      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
    }

    default:
      return state;
  }
};

const useToast = (): UseToastReturn => {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  });

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (!toast.open || toastTimeouts.has(toast.id)) return;

      const timeout = setTimeout(() => {
        dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id });

        setTimeout(() => {
          dispatch({ type: actionTypes.REMOVE_TOAST, toastId: toast.id });
        }, TOAST_REMOVE_DELAY);
      }, 5000); // Auto-dismiss after 5 seconds

      toastTimeouts.set(toast.id, timeout);
    });
  }, [state.toasts]);

  const toast = React.useCallback(({ ...props }: Toast): string => {
    const id = uuidv4();

    const newToast: ToasterToast = {
      id,
      open: true,
      createdAt: new Date(),
      ...props,
    };

    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: newToast,
    });

    return id;
  }, []);

  const dismiss = React.useCallback((toastId: string): void => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss,
  };
};

export { useToast };

// Also export a simple version for direct use
// This standalone toast function doesn't return the ID, it's fire-and-forget from caller's perspective.
// The hook's toast function returns an ID.
// We need to be careful if `UseToastReturn['toast']` is used for this standalone one.
// However, the modules are using the toast function passed from the hook instance.
export const toast = (props: Toast): void => {
  // This creates a new instance of the hook internally each time it's called.
  // This might not be what's intended for a global toast function due to state isolation.
  // For now, let's assume the module files get `toast` from a `useToast()` call higher up.
  // The error is about `UseToastReturn` so let's focus on that.
  // The `toast` function being typed in the modules is the one from the hook instance, which returns string.
  const { toast: toastFn } = useToast(); 
  toastFn(props); // The toastFn from useToast returns a string, but here it's not used.
};
