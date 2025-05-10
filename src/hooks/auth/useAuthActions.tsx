
import { useLogin } from "./useLogin";
import { useLogout } from "./useLogout";
import { useRegister } from "./useRegister";
import { UserRole } from "@/types";

export function useAuthActions() {
  const { isLoading: isLoginLoading, login } = useLogin();
  const { isLoading: isLogoutLoading, logout } = useLogout();
  const { isLoading: isRegisterLoading, register } = useRegister();

  const isLoading = isLoginLoading || isLogoutLoading || isRegisterLoading;

  return {
    isLoading,
    login,
    logout,
    register
  };
}
