import { useEffect, useState } from "react";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NotificationBell() {
  const {
    unreadCounts,
    chats,
    allContacts,
    getAllContacts,
    setActiveTab,
    setSelectedUser,
    markAllConversationsRead,
  } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const unreadEntries = Object.entries(unreadCounts).sort((left, right) => right[1] - left[1]);
  const unreadTotal = unreadEntries.reduce((total, [, count]) => total + count, 0);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const toggleNotifications = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen && allContacts.length === 0) getAllContacts();
  };

  const openConversation = (userId) => {
    const partner = [...chats, ...allContacts].find((user) => user._id === userId);
    if (!partner) {
      getAllContacts();
      return;
    }
    setActiveTab("chats");
    setSelectedUser(partner);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleNotifications}
        className="relative rounded-lg p-2 text-slate-400 transition hover:bg-slate-700/60 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        aria-label={`Notifications${unreadTotal ? `, ${unreadTotal} unread messages` : ""}`}
        aria-expanded={isOpen}
        aria-controls="unread-notifications"
        title="Unread messages"
      >
        <BellIcon className="size-5" />
        {unreadTotal > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-800 bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadTotal > 99 ? "99+" : unreadTotal}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="unread-notifications"
          className="absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-left shadow-2xl shadow-black/40"
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Notifications</h4>
              <p className="mt-0.5 text-xs text-slate-400">
                {unreadTotal ? `${unreadTotal} unread message${unreadTotal === 1 ? "" : "s"}` : "You're all caught up"}
              </p>
            </div>
            {unreadTotal > 0 && (
              <button
                type="button"
                onClick={markAllConversationsRead}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-500/10"
              >
                <CheckCheckIcon className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {unreadEntries.length ? (
            <div className="max-h-72 space-y-1 overflow-y-auto p-2">
              {unreadEntries.map(([userId, count]) => {
                const partner = [...chats, ...allContacts].find((user) => user._id === userId);
                return (
                  <button
                    key={userId}
                    type="button"
                    onClick={() => openConversation(userId)}
                    disabled={!partner}
                    className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                  >
                    <img src="/avatar.png" alt="" className="size-10 rounded-full bg-slate-800" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-100">
                        {partner?.fullName || "Loading contact…"}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {count} unread message{count === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="size-2 rounded-full bg-cyan-400" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <BellIcon className="size-4" />
              </span>
              <p className="text-sm text-slate-300">No unread messages</p>
              <p className="mt-1 text-xs text-slate-500">New messages will show up here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
