import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { Message } from "../types/message";
import { User } from "../types/user";

interface ChatState {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    setSelectedUser: (selectedUser: User) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({isUsersLoading: true})
        try {
            const res = await axiosInstance.get('/messages/users')
            set({users: res.data})
        } catch (error) {
            console.log(error)
            toast.error("Произошла неизвестная ошибка")
        } finally {
            set({isUsersLoading: false})
        }
    },

    getMessages: async (userId: string) => {
        set({isMessagesLoading: true})
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({messages: res.data})
        } catch (error) {
            console.log(error)
            toast.error("Произошла неизвестная ошибка")
        } finally {
            set({isMessagesLoading: false})
        }
    },

    setSelectedUser: (selectedUser: User) => set({selectedUser})
}))