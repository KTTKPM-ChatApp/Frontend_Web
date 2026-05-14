import { create } from "zustand";
import { IEditProfileForm } from "../interface/user-interface";
import { useAuthStore } from "./useAuthStore";

export interface UseUserStoreProps {
  openProfileModal: boolean;
  setOpenProfileModal: (open: boolean) => void;

  openEditProfileModal: boolean;
  setOpenEditProfileModal: (open: boolean) => void;

  pendingOpenEditProfile: boolean;
  setPendingOpenEditProfile: (pending: boolean) => void;

  editProfileData: IEditProfileForm;
  setEditProfileField: (key: keyof IEditProfileForm, value: string) => void;

  fillEditProfileFormFromAuth: () => void;
  resetEditProfileForm: () => void;
  resetUserStore: () => void;
}

const initialEditProfileData: IEditProfileForm = {
  fullName: "",
  displayName: "",
  bio: "",
  gender: "",
  dateOfBirth: "",
  phone: "",
  username: "",
  email: "",
  isActive: false,
  createdAt: "",
  updatedAt: "",
};

export const useUserStore = create<UseUserStoreProps>()((set) => ({
  openProfileModal: false,
  setOpenProfileModal: (open) => set({ openProfileModal: open }),

  openEditProfileModal: false,
  setOpenEditProfileModal: (open) => set({ openEditProfileModal: open }),

  pendingOpenEditProfile: false,
  setPendingOpenEditProfile: (pending) => set({ pendingOpenEditProfile: pending }),

  editProfileData: initialEditProfileData,

  setEditProfileField: (key, value) =>
    set((state) => ({
      editProfileData: {
        ...state.editProfileData,
        [key]: value,
      },
    })),

  fillEditProfileFormFromAuth: () => {
    const user = useAuthStore.getState().authData?.data?.user;

    set({
      editProfileData: {
        fullName: user?.fullName ?? user?.displayName ?? "",
        displayName: user?.displayName ?? user?.fullName ?? "",
        bio: user?.bio ?? "",
        gender: user?.gender ?? "",
        dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth) : "",
        phone: user?.phone ?? "",
        username: user?.username ?? "",
        email: user?.email ?? "",
        isActive: user?.isActive ?? false,
        createdAt: user?.createdAt ? String(user.createdAt) : "",
        updatedAt: user?.updatedAt ? String(user.updatedAt) : "",
      },
    });
  },

  resetEditProfileForm: () =>
    set({
      editProfileData: initialEditProfileData,
    }),

  resetUserStore: () =>
    set({
      openProfileModal: false,
      openEditProfileModal: false,
      pendingOpenEditProfile: false,
      editProfileData: initialEditProfileData,
    }),
}));
