import { create } from "zustand";
import type { User } from "../types/user";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

type UserInSignUp = Pick<User, 'fullName' | 'email' | 'password'>
type UserInLogIn = Pick<User, "email" | "password">;

interface AuthState {
    authUser: null | User,
    onlineUsers: string[],
    isSigningUp: boolean,
    isCheckingAuth: boolean,
    isLoging: boolean,
    isUpdatingProfile: boolean,
    checkAuth: () => Promise<void>,
    signUp: (data: UserInSignUp) => Promise<void>,
    logOut: () => Promise<void>,
    logIn: (data: UserInLogIn) => Promise<void>,
    updateProfile: (data: { profilePic: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoging: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data })
        } catch {
            console.log(`Error in checkAuth`)
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },
    signUp: async (data: UserInSignUp) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post('/auth/signup', data)
            toast.success("Аккаунт успешно создан")
            set({ authUser: res.data })
        } catch (error) {
            // if (error instanceof AxiosError && error.response && error.response.data) {
            //     toast.error(error.response.data.message);
            // } else {
            //     toast.error("Произошла неизвестная ошибка");
            // }
            console.log(error)
            toast.error("Произошла неизвестная ошибка")
        } finally {
            set({ isSigningUp: false })
        }
    },
    logOut: async () => {
        try {
            await axiosInstance.post('/auth/logout')
            set({ authUser: null })
            toast.success('Вы успешно вышли из системы')
        } catch (error) {
            console.log(error)
            toast.error("Произошла неизвестная ошибка")
        }
    },
    logIn: async (data: UserInLogIn) => {
        set({ isLoging: true })
        try {
            const res = await axiosInstance.post('/auth/login', data)
            set({ authUser: res.data })
            toast.success('Вы успешно вошли в аккаунт')
        } catch (error) {
            console.log(error)
            toast.error("Произошла неизвестная ошибка")
        } finally {
            set({ isLoging: false })
        }
    },

    updateProfile: async (data: { profilePic: string }) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Фотография профиля успешно обновлена");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error("Произошла неизвестная ошибка");
        } finally {
            set({ isUpdatingProfile: false });
        }
    }
}))