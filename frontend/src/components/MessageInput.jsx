import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { SendIcon } from "lucide-react";

function MessageInput() {
  const [text, setText] = useState("");
  const { sendMessage } = useChatStore();

  const handleSendMessage = (event) => {
    event.preventDefault();
    const message = text.trim();
    if (!message) return;

    sendMessage({ text: message });
    setText("");
  };

  return (
    <div className="p-4 border-t border-slate-700/50">
      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-4">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4"
          placeholder="Type your message..."
          aria-label="Message"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
