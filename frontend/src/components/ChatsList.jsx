import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { SearchIcon, MessageCircleIcon } from "lucide-react";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, selectedUser, setSelectedUser, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  const filteredChats = chats.filter((chat) => chat.fullName.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-2">
      <label className="relative mb-3 block">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
          className="w-full rounded-xl border border-slate-700/70 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
        />
      </label>
      {filteredChats.length ? filteredChats.map((chat) => (
        <button
          key={chat._id}
          type="button"
          aria-current={selectedUser?._id === chat._id ? "true" : undefined}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${selectedUser?._id === chat._id ? "border-cyan-500/30 bg-cyan-500/10" : "border-transparent bg-slate-800/35 hover:border-slate-700 hover:bg-slate-800/80"}`}
          onClick={() => setSelectedUser(chat)}
        >
          <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
            <div className="size-12 rounded-full">
              <img src="/avatar.png" alt="" />
            </div>
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">{chat.fullName}</span>
          {unreadCounts[chat._id] ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCounts[chat._id] > 99 ? "99+" : unreadCounts[chat._id]}
            </span>
          ) : <MessageCircleIcon className="size-4 shrink-0 text-slate-600" />}
        </button>
      )) : <p className="px-2 py-8 text-center text-sm text-slate-500">No conversations match “{query}”.</p>}
    </div>
  );
}
export default ChatsList;
