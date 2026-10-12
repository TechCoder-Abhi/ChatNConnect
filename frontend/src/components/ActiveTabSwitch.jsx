import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="mx-4 mt-4 grid grid-cols-2 rounded-xl border border-slate-700/60 bg-slate-900/40 p-1" role="tablist" aria-label="Contact views">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "chats"}
        onClick={() => setActiveTab("chats")}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
          activeTab === "chats" ? "bg-slate-700/70 text-white shadow" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Chats
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "contacts"}
        onClick={() => setActiveTab("contacts")}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
          activeTab === "contacts" ? "bg-slate-700/70 text-white shadow" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
