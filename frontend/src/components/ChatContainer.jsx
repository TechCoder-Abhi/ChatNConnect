import { useEffect, useRef } from "react";
import { CheckCheckIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    isLoadingOlderMessages,
    hasMoreMessages,
    loadOlderMessages,
    markConversationRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesViewportRef = useRef(null);
  const preserveScrollRef = useRef(false);
  const scrollSnapshotRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    markConversationRead(selectedUser._id, true);
  }, [selectedUser, getMessagesByUserId, markConversationRead]);

  useEffect(() => {
    if (preserveScrollRef.current && messagesViewportRef.current && scrollSnapshotRef.current) {
      const viewport = messagesViewportRef.current;
      const { height, top } = scrollSnapshotRef.current;
      viewport.scrollTop = top + viewport.scrollHeight - height;
      preserveScrollRef.current = false;
      scrollSnapshotRef.current = null;
      return;
    }

    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleLoadOlderMessages = async () => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;

    scrollSnapshotRef.current = { height: viewport.scrollHeight, top: viewport.scrollTop };
    preserveScrollRef.current = true;
    await loadOlderMessages();
    requestAnimationFrame(() => {
      if (preserveScrollRef.current) {
        preserveScrollRef.current = false;
        scrollSnapshotRef.current = null;
      }
    });
  };

  return (
    <>
      <ChatHeader />
      <div ref={messagesViewportRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8" aria-live="polite" aria-label={`Messages with ${selectedUser.fullName}`}>
        {hasMoreMessages && !isMessagesLoading && (
          <div className="mx-auto mb-6 flex max-w-3xl justify-center">
            <button
              type="button"
              onClick={handleLoadOlderMessages}
              disabled={isLoadingOlderMessages}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/70 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingOlderMessages && <LoaderCircleIcon className="size-3.5 animate-spin" />}
              {isLoadingOlderMessages ? "Loading messages…" : "Load older messages"}
            </button>
          </div>
        )}
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="mt-1 flex items-center gap-1 text-xs opacity-75">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.senderId === authUser._id && (
                      msg.readAt
                        ? <CheckCheckIcon className="size-3.5 text-cyan-200" aria-label="Seen" />
                        : <CheckIcon className="size-3.5" aria-label="Sent" />
                    )}
                  </p>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
