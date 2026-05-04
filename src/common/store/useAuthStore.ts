import { create } from "zustand";
import { IApiResponse, IAuthData } from "../interface/auth-interface";

interface UseAuthStoreProps {
  authData: IApiResponse<IAuthData> | null;
  setAuthData: (data: IApiResponse<IAuthData> | null) => void;

  loadingAuth: boolean;
  setLoadingAuth: (loading: boolean) => void;

  errorAuth: string | null;
  setErrorAuth: (error: string | null) => void;

  resetAuth: () => void;
}

export const useAuthStore = create<UseAuthStoreProps>()((set) => ({
  authData: null,
  setAuthData: (data) => set({ authData: data }),

  loadingAuth: false,
  setLoadingAuth: (loading) => set({ loadingAuth: loading }),

  errorAuth: null,
  setErrorAuth: (error) => set({ errorAuth: error }),

  resetAuth: () =>
    set({
      authData: null,
      loadingAuth: false,
      errorAuth: null,
    }),
}));