import { create } from "zustand";
import type { User } from "../types/user";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

type UserInSignUp = Pick<User, 'fullName' | 'email' | 'password'>
type UserInLogIn = Pick<User, "email" | "password">;

const BASE_URL: string = "http://localhost:5001"

interface AuthState {
    authUser: null | User,
    onlineUsers: string[],
    isSigningUp: boolean,
    isCheckingAuth: boolean,
    isLoging: boolean,
    isUpdatingProfile: boolean,
    socket: null | Socket,
    checkAuth: () => Promise<void>,
    signUp: (data: UserInSignUp) => Promise<void>,
    logOut: () => Promise<void>,
    logIn: (data: UserInLogIn) => Promise<void>,
    updateProfile: (data: { profilePic: string }) => Promise<void>,
    connectSocket: () => void,
    disconnectSocket: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoging: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data })

            get().connectSocket()
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

            get().connectSocket()
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

            get().disconnectSocket()
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

            get().connectSocket()
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
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;


        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id
            }
        });
        socket.connect();

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds: string[]) => {
            set({ onlineUsers: userIds })
        })
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket?.disconnect();
    }
}))