import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, subscribeToMessages, unsubscribeFromMessages, fetchUnreadCounts } = useChatStore();

  useEffect(() => {
    subscribeToMessages();
    fetchUnreadCounts();
    return unsubscribeFromMessages;
  }, [subscribeToMessages, unsubscribeFromMessages, fetchUnreadCounts]);

  return (
    <div className="relative w-full max-w-6xl h-[min(800px,calc(100dvh-2rem))] min-h-[32rem]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-80 min-w-0 bg-slate-800/50 backdrop-blur-sm flex-col`}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={`${selectedUser ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col bg-slate-900/50 backdrop-blur-sm`}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
