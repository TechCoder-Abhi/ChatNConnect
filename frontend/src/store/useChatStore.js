import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoadingOlderMessages: false,
  hasMoreMessages: false,
  olderMessagesCursor: null,
  unreadCounts: {},
  unreadRevision: 0,
  unreadFetchId: 0,
  readReceiptsByUser: {},
  seenSocketMessageIds: [],
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) =>
    set((state) => {
      const unreadCounts = { ...state.unreadCounts };
      if (selectedUser?._id) delete unreadCounts[selectedUser._id];
      return {
        selectedUser,
        messages: [],
        isMessagesLoading: Boolean(selectedUser),
        isLoadingOlderMessages: false,
        hasMoreMessages: false,
        olderMessagesCursor: null,
        unreadCounts,
        unreadRevision: state.unreadRevision + 1,
      };
    }),

  fetchUnreadCounts: async () => {
    const revisionAtStart = get().unreadRevision;
    const fetchId = get().unreadFetchId + 1;
    set({ unreadFetchId: fetchId });
    try {
      const res = await axiosInstance.get("/messages/unread");
      const unreadCounts = Object.fromEntries(
        res.data.map(({ senderId, count }) => [senderId.toString(), count])
      );
      if (get().unreadFetchId !== fetchId) return;
      if (get().unreadRevision === revisionAtStart) set({ unreadCounts });
      else await get().fetchUnreadCounts(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load unread messages");
    }
  },

  markConversationRead: async (userId, refreshCounts = false) => {
    if (!userId) return;
    set((state) => {
      const unreadCounts = { ...state.unreadCounts };
      delete unreadCounts[userId];
      return { unreadCounts, unreadRevision: state.unreadRevision + 1 };
    });

    try {
      await axiosInstance.patch(`/messages/read/${userId}`);
      if (refreshCounts) await get().fetchUnreadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark conversation as read");
      get().fetchUnreadCounts();
    }
  },

  markAllConversationsRead: async () => {
    set((state) => ({ unreadCounts: {}, unreadRevision: state.unreadRevision + 1 }));
    try {
      await axiosInstance.patch("/messages/read-all");
      await get().fetchUnreadCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark messages as read");
      get().fetchUnreadCounts();
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ messages: [], isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      if (get().selectedUser?._id !== userId) return;

      set((state) => {
        const loadedIds = new Set(res.data.messages.map((message) => message._id));
        const liveMessages = state.messages.filter((message) => !loadedIds.has(message._id));
        return {
          messages: [...res.data.messages, ...liveMessages].sort(
            (left, right) => new Date(left.createdAt) - new Date(right.createdAt)
          ),
          hasMoreMessages: res.data.hasMore,
          olderMessagesCursor: res.data.nextCursor,
        };
      });
    } catch (error) {
      if (get().selectedUser?._id !== userId) return;
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      if (get().selectedUser?._id === userId) set({ isMessagesLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const { selectedUser, olderMessagesCursor, hasMoreMessages, isLoadingOlderMessages } = get();
    if (!selectedUser || !olderMessagesCursor || !hasMoreMessages || isLoadingOlderMessages) return;

    const userId = selectedUser._id;
    set({ isLoadingOlderMessages: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        params: { cursor: olderMessagesCursor },
      });
      if (get().selectedUser?._id !== userId) return;

      set((state) => {
        const existingIds = new Set(state.messages.map((message) => message._id));
        const olderMessages = res.data.messages.filter((message) => !existingIds.has(message._id));
        return {
          messages: [...olderMessages, ...state.messages],
          hasMoreMessages: res.data.hasMore,
          olderMessagesCursor: res.data.nextCursor,
        };
      });
    } catch (error) {
      if (get().selectedUser?._id === userId) {
        toast.error(error.response?.data?.message || "Unable to load older messages");
      }
    } finally {
      if (get().selectedUser?._id === userId) set({ isLoadingOlderMessages: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set((state) => ({ messages: [...state.messages, optimisticMessage] }));

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set((state) => {
        const chats = [selectedUser, ...state.chats.filter((chat) => chat._id !== selectedUser._id)];
        if (state.selectedUser?._id !== selectedUser._id) return { chats };
        const readAt = state.readReceiptsByUser[selectedUser._id];
        const returnedMessage = readAt && new Date(readAt) >= new Date(res.data.createdAt)
          ? { ...res.data, readAt }
          : res.data;
        if (state.messages.some((message) => message._id === res.data._id)) {
          return {
            messages: state.messages.filter((message) => message._id !== tempId),
            chats,
          };
        }
        const optimisticMessageExists = state.messages.some((message) => message._id === tempId);
        return {
          chats,
          messages: optimisticMessageExists
            ? state.messages.map((message) => message._id === tempId ? returnedMessage : message)
            : [...state.messages, returnedMessage],
        };
      });
    } catch (error) {
      set((state) => ({ messages: state.messages.filter((message) => message._id !== tempId) }));
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage", get().handleIncomingMessage);
    socket.off("messagesRead", get().handleMessagesRead);
    socket.off("conversationMarkedRead", get().handleConversationMarkedRead);
    socket.off("allMessagesMarkedRead", get().handleAllMessagesMarkedRead);
    socket.on("newMessage", get().handleIncomingMessage);
    socket.on("messagesRead", get().handleMessagesRead);
    socket.on("conversationMarkedRead", get().handleConversationMarkedRead);
    socket.on("allMessagesMarkedRead", get().handleAllMessagesMarkedRead);
  },

  handleIncomingMessage: (newMessage) => {
    const messageId = newMessage._id?.toString();
    if (!messageId || get().seenSocketMessageIds.includes(messageId)) return;

    const senderId = newMessage.senderId.toString();
    const { selectedUser, messages } = get();
    const isCurrentConversation = selectedUser?._id === senderId;
    const messageAlreadyLoaded = messages.some((message) => message._id === messageId);
    const otherUser = [...get().chats, ...get().allContacts].find((user) => user._id === senderId);

    set((state) => {
      const seenSocketMessageIds = [...state.seenSocketMessageIds, messageId].slice(-300);
      const unreadCounts = { ...state.unreadCounts };
      if (isCurrentConversation) delete unreadCounts[senderId];
      else unreadCounts[senderId] = (unreadCounts[senderId] || 0) + 1;

      const chats = otherUser
        ? [otherUser, ...state.chats.filter((chat) => chat._id !== senderId)]
        : state.chats;
      const nextMessages = isCurrentConversation && !messageAlreadyLoaded
        ? [...state.messages, newMessage]
        : state.messages;

      return {
        seenSocketMessageIds,
        unreadCounts,
        unreadRevision: state.unreadRevision + 1,
        chats,
        messages: nextMessages,
      };
    });

    if (isCurrentConversation) get().markConversationRead(senderId);
    if (get().isSoundEnabled) {
      const notificationSound = new Audio("/sounds/notification.mp3");
      notificationSound.play().catch(() => {});
    }
  },

  handleMessagesRead: ({ readerId, readAt }) => {
    const senderId = useAuthStore.getState().authUser?._id;
    if (!senderId) return;
    set((state) => ({
      readReceiptsByUser: { ...state.readReceiptsByUser, [readerId]: readAt },
      messages: state.messages.map((message) =>
        message.senderId === senderId && message.receiverId === readerId &&
          new Date(readAt) >= new Date(message.createdAt)
          ? { ...message, readAt }
          : message
      ),
    }));
  },

  handleConversationMarkedRead: ({ senderId }) => {
    set((state) => {
      const unreadCounts = { ...state.unreadCounts };
      delete unreadCounts[senderId];
      return { unreadCounts, unreadRevision: state.unreadRevision + 1 };
    });
  },

  handleAllMessagesMarkedRead: () => {
    set((state) => ({ unreadCounts: {}, unreadRevision: state.unreadRevision + 1 }));
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage", get().handleIncomingMessage);
    socket?.off("messagesRead", get().handleMessagesRead);
    socket?.off("conversationMarkedRead", get().handleConversationMarkedRead);
    socket?.off("allMessagesMarkedRead", get().handleAllMessagesMarkedRead);
  },
}));
