import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IApiResponse, IAuthResponse } from "../interface/auth-interface";

interface UseAuthStoreProps {
  authData: IApiResponse<IAuthResponse> | null;
  setAuthData: (data: IApiResponse<IAuthResponse> | null) => void;

  loadingAuth: boolean;
  setLoadingAuth: (loading: boolean) => void;

  errorAuth: string | null;
  setErrorAuth: (error: string | null) => void;

  resetAuth: () => void;
}

export const useAuthStore = create<UseAuthStoreProps>()(
  persist(
    (set) => ({
      authData: null,
      setAuthData: (data: IApiResponse<IAuthResponse> | null) => set({ authData: data }),

      loadingAuth: false,
      setLoadingAuth: (loading: boolean) => set({ loadingAuth: loading }),

      errorAuth: null,
      setErrorAuth: (error: string | null) => set({ errorAuth: error }),

      resetAuth: () =>
        set({
          authData: null,
          loadingAuth: false,
          errorAuth: null,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: UseAuthStoreProps) => ({
        authData: state.authData,
        loadingAuth: state.loadingAuth,
        errorAuth: state.errorAuth,
      }),
    }
  )
);