
import { useLogin } from "./useLogin";
import { useLogout } from "./useLogout";
import { useRegister } from "./useRegister";

export function useAuthActions() {
  const { login, isLoading: isLoginLoading } = useLogin();
  const { logout, isLoading: isLogoutLoading } = useLogout();
  const { register, isLoading: isRegisterLoading } = useRegister();
  
  return {
    login,
    logout,
    register,
    isLoginLoading,
    isLogoutLoading,
    isRegisterLoading
  };
}
