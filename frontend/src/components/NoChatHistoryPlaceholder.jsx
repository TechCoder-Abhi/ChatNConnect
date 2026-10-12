import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const suggestions = ["Hi, how are you?", "Nice to connect with you!", "Are you free to chat?"];

function NoChatHistoryPlaceholder({ name }) {
  const { sendMessage } = useChatStore();

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/20 to-cyan-400/5 shadow-lg shadow-cyan-950/20">
        <MessageCircleIcon className="size-7 text-cyan-300" />
      </div>
      <span className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">A fresh start</span>
      <h3 className="mb-2 text-lg font-semibold text-slate-100">Say hello to {name}</h3>
      <p className="mb-5 max-w-sm text-sm leading-6 text-slate-400">
        This is the beginning of your conversation. Choose a prompt or write your own message.
      </p>
      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => sendMessage({ text: suggestion })}
            className="rounded-full border border-slate-700/70 bg-slate-800/60 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default NoChatHistoryPlaceholder;
