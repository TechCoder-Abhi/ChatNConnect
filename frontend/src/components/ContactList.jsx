import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { SearchIcon, UserRoundIcon } from "lucide-react";

function ContactList() {
  const { getAllContacts, allContacts, selectedUser, setSelectedUser, isUsersLoading, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  const filteredContacts = allContacts.filter((contact) => contact.fullName.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-2">
      <label className="relative mb-3 block">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people"
          aria-label="Search contacts"
          className="w-full rounded-xl border border-slate-700/70 bg-slate-900/50 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
        />
      </label>
      {filteredContacts.length ? filteredContacts.map((contact) => (
        <button
          key={contact._id}
          type="button"
          aria-current={selectedUser?._id === contact._id ? "true" : undefined}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${selectedUser?._id === contact._id ? "border-cyan-500/30 bg-cyan-500/10" : "border-transparent bg-slate-800/35 hover:border-slate-700 hover:bg-slate-800/80"}`}
          onClick={() => setSelectedUser(contact)}
        >
          <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
            <div className="size-12 rounded-full">
              <img src="/avatar.png" alt="" />
            </div>
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">{contact.fullName}</span>
          {unreadCounts[contact._id] ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCounts[contact._id] > 99 ? "99+" : unreadCounts[contact._id]}
            </span>
          ) : <UserRoundIcon className="size-4 shrink-0 text-slate-600" />}
        </button>
      )) : <p className="px-2 py-8 text-center text-sm text-slate-500">{allContacts.length ? `No people match “${query}”.` : "No other members yet."}</p>}
    </div>
  );
}
export default ContactList;
