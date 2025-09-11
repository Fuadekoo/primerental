"use client";
import useAction from "@/hooks/useActions";
// import useGuestSession from "@/hooks/useGuestSession";
import {
  getAdminChat,
  getGuestList,
  getLoginUserId,
  readAdminMessages,
} from "@/actions/common/chat";
import io from "socket.io-client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  X,
  Send,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";

// Use the new, more detailed message type
type ChatMessage = {
  id: string;
  fromUserId: string; // Can be guestId or adminId
  toUserId: string; // Can be guestId or adminId
  msg: string;
  createdAt: Date;
  isRead?: boolean; // New field to track read status
  self?: boolean;
};

export default function ChatPopup() {
  //   const guestId = useGuestSession();
  const [user, ,] = useAction(getLoginUserId, [true, () => {}]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // Update state to use the new ChatMessage type
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectGuestId, setSelectGuestId] = useState<string | null>(null);
  const [onlineGuests, setOnlineGuests] = useState<Set<string>>(new Set());
  // Real-time guest summaries: newest first with unread counts
  type GuestSummary = {
    guestId: string;
    unread: number;
    lastMsg?: string;
    lastAt?: string;
  };
  const [guests, setGuests] = useState<GuestSummary[]>([]);
  console.log("Selected Guest ID in AdminChatPopup:", selectGuestId);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  // Action to get the admin user to message
  const [guestList, , isLoadingGuestList] = useAction(getGuestList, [
    true,
    () => {},
  ]);
  // Seed from API initially (unread = 0)
  useEffect(() => {
    if (guestList?.length) {
      setGuests(guestList.map((g: any) => ({ guestId: g.guestId, unread: 0 })));
    }
  }, [guestList]);

  // Action to get existing chat messages
  const [chatHistory, fetchChat, isFetchingChat] = useAction(getAdminChat, [
    ,
    () => {},
  ]);

  // action to mark messages as read
  const [, readAction] = useAction(readAdminMessages, [, () => {}]);

  useEffect(() => {
    if (chatHistory && userId) {
      const formattedMessages = chatHistory.map((msg) => ({
        id: msg.id,
        fromUserId: (msg.fromUserId ?? msg.fromGuestId) || "", // Ensure string
        toUserId: (msg.toUserId ?? msg.toGuestId) || "", // Ensure string
        msg: msg.msg,
        createdAt: new Date(msg.createdAt),
        isRead: msg.isRead,
        self: (msg.fromUserId ?? msg.fromGuestId) === userId, // Compare with fallback
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [chatHistory, userId]);

  const stableFetchChat = useCallback(fetchChat, []);

  useEffect(() => {
    setMessages([]); // Clear messages when guest selection changes
    if (selectGuestId) {
      fetchChat(selectGuestId);
      readAction(selectGuestId); // Mark messages as read when fetching
      // Clear unread locally and inform server
      upsertGuest({ guestId: selectGuestId, unread: 0 });
      socket?.emit?.("admin_read", { guestId: selectGuestId });
    }
  }, [selectGuestId, stableFetchChat]);

  // Effect to manage Socket.IO connection
  useEffect(() => {
    if (!isOpen || !userId) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
    if (!socketUrl) {
      console.error("NEXT_PUBLIC_SOCKET_URL environment variable is not set");
      return;
    }

    const newSocket = io(socketUrl, {
      auth: { id: userId },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    const onConnect = () => {
      console.log("Socket connected for user with ID:", userId);
      // Request server to send latest guest summaries
      newSocket.emit("request_admin_guest_list");
    };

    const onDisconnect = (reason: string) => {
      console.log("Socket disconnected. Reason:", reason);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    };

    // Handle incoming messages for the admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAdminMessage = (message: any) => {
      // These are the session/DB IDs from the server payload
      const fromId = message.fromGuestId ?? message.fromUserId;
      const toId = message.toGuestId ?? message.toUserId;
      console.log(
        "Received message from admin : ",
        fromId,
        toId,
        selectGuestId,
        userId
      );

      // Check if the message belongs to the currently active chat
      if (
        (fromId === selectGuestId && toId === userId) || // Message from selected guest to me
        (fromId === userId && toId === selectGuestId) // Message from me to selected guest (echo)
      ) {
        setMessages((prev) => [...prev, message]);
        const preview = String(message.msg || "").slice(0, 80);
        upsertGuest({
          guestId: fromId === userId ? toId : fromId,
          lastMsg: preview,
          lastAt: new Date().toISOString(),
          unread: 0,
        });
      } else {
        // Bump unread for that guest and move to top by recency
        if (toId === userId && fromId) {
          const preview = String(message.msg || "").slice(0, 80);
          setGuests((prev) => {
            const idx = prev.findIndex((g) => g.guestId === fromId);
            const nowIso = new Date().toISOString();
            if (idx === -1)
              return sortGuests([
                ...prev,
                {
                  guestId: fromId,
                  unread: 1,
                  lastMsg: preview,
                  lastAt: nowIso,
                },
              ]);
            const next = [...prev];
            const current = next[idx];
            next[idx] = {
              ...current,
              unread: (current.unread || 0) + 1,
              lastMsg: preview,
              lastAt: nowIso,
            };
            return sortGuests(next);
          });
        }
      }
    };
    const handleAdminGuestList = (items: GuestSummary[]) => {
      setGuests(sortGuests(items || []));
    };

    const handleOnlineGuests = (onlineGuestIds: string[]) => {
      setOnlineGuests(new Set(onlineGuestIds));
    };

    const handleGuestOnline = (guestId: string) => {
      setOnlineGuests((prev) => new Set(prev).add(guestId));
    };

    const handleGuestOffline = (guestId: string) => {
      setOnlineGuests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(guestId);
        return newSet;
      });
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("chat_to_admin", handleAdminMessage);
    newSocket.on("online_guests_list", handleOnlineGuests);
    newSocket.on("admin_guest_list", handleAdminGuestList);
    newSocket.on("guest_online", handleGuestOnline);
    newSocket.on("guest_offline", handleGuestOffline);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("chat_to_admin", handleAdminMessage);
      newSocket.off("online_guests_list", handleOnlineGuests);
      newSocket.off("admin_guest_list", handleAdminGuestList);
      newSocket.off("guest_online", handleGuestOnline);
      newSocket.off("guest_offline", handleGuestOffline);
      newSocket.disconnect();
    };
  }, [isOpen, userId, selectGuestId]);

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !socket || !userId || !selectGuestId)
      return;

    // Create the message object for optimistic UI update
    const userMessage: ChatMessage = {
      id: Date.now().toString(), // Temporary ID for the key
      fromUserId: userId,
      toUserId: selectGuestId,
      msg: newMessage,
      createdAt: new Date(),
      self: true,
      // isRead: true,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Emit the message to the server
    socket.emit("chat_to_customer", {
      fromUserId: userId,
      toGuestId: selectGuestId,
      msg: newMessage,
    });

    setNewMessage("");
  };

  const handleBackToGuestList = () => {
    setSelectGuestId(null);
  };

  // Helpers to maintain sorted guest list and unread counts
  const sortGuests = (arr: GuestSummary[]) =>
    [...arr].sort((a, b) => {
      const at = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const bt = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      if (bt !== at) return bt - at; // latest first
      return (b.unread || 0) - (a.unread || 0); // then unread desc
    });

  const upsertGuest = (
    partial: Partial<GuestSummary> & { guestId: string }
  ) => {
    setGuests((prev) => {
      const idx = prev.findIndex((g) => g.guestId === partial.guestId);
      if (idx === -1)
        return sortGuests([...prev, { unread: 0, ...partial } as GuestSummary]);
      const next = [...prev];
      next[idx] = { ...next[idx], ...partial } as GuestSummary;
      return sortGuests(next);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div
        className={`rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out border
        bg-white/90 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800
        w-[90vw] sm:w-96 h-[70vh] sm:h-[32rem]
        ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "hidden translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 rounded-t-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400">
          {selectGuestId ? (
            <button
              onClick={handleBackToGuestList}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Back to list"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span className="w-6" />
          )}
          <h3 className="font-bold text-sm sm:text-base">
            {selectGuestId ? "Chat with Guest" : "Select a Guest"}
          </h3>
          <button
            onClick={toggleChat}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {selectGuestId ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-neutral-950/40">
              <div className="space-y-3">
                {isFetchingChat ? (
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    Loading chat...
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.self ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow
                          ${
                            msg.self
                              ? "bg-primary-600 dark:bg-primary-500 text-white rounded-br-none"
                              : "bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-neutral-700"
                          }`}
                      >
                        <p>{msg.msg}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[11px] mt-1
                            ${
                              msg.self
                                ? "text-primary-100"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.self && (
                            <span className="flex-shrink-0">
                              {msg.isRead ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Check size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-slate-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900 rounded-b-xl">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 w-full rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2 px-3 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                  disabled={!selectGuestId}
                />
                <button
                  type="submit"
                  className="p-2 rounded-full text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 transition-colors flex-shrink-0 disabled:bg-primary-400/60 disabled:cursor-not-allowed"
                  aria-label="Send Message"
                  disabled={!newMessage.trim() || !selectGuestId}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          // Guest list
          <div className="flex-1 overflow-y-auto bg-white/60 dark:bg-neutral-900/40">
            {isLoadingGuestList ? (
              <div className="p-3 text-center text-slate-500 dark:text-slate-400">
                Loading guests...
              </div>
            ) : (
              guests?.map((guest) => (
                <div
                  key={guest.guestId}
                  onClick={() => setSelectGuestId(guest.guestId)}
                  className="p-3 cursor-pointer border-b border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      Guest
                    </p>
                    {onlineGuests.has(guest.guestId) ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-300 dark:bg-green-500/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-300 dark:bg-red-500/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Offline
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {guest.lastMsg || guest.guestId}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {guest.lastAt
                        ? new Date(guest.lastAt).toLocaleString()
                        : ""}
                    </span>
                    {guest.unread > 0 && (
                      <span className="inline-flex items-center justify-center h-5 px-2 rounded-full text-xs font-medium bg-primary-600 text-white">
                        {guest.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="mt-4 float-right p-3 rounded-full text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 shadow-lg ring-2 ring-white/60 dark:ring-neutral-800 transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0"
        aria-label="Toggle Chat"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
