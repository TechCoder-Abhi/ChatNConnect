import { ArrowLeftIcon, XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import NotificationBell from "./NotificationBell";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && !document.getElementById("unread-notifications")) {
        setSelectedUser(null);
      }
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex min-h-[76px] items-center justify-between border-b border-slate-700/50 bg-slate-800/50 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-100 md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="size-11 rounded-full">
            <img src="/avatar.png" alt="" />
          </div>
        </div>

        <div>
          <h3 className="max-w-[12rem] truncate text-sm font-semibold text-slate-100">{selectedUser.fullName}</h3>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`size-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-slate-500"}`} />
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="md:hidden">
          <NotificationBell />
        </div>
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-100 md:block"
          aria-label="Close conversation"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
