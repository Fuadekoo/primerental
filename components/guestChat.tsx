"use client";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import useGuestSession from "@/hooks/useGuestSession";
import {
  getGuestChat,
  getAdmin,
  readGuestMessages,
  countUnreadMessagesForGuest,
} from "@/actions/common/chat";
import io from "socket.io-client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Check, CheckCheck } from "lucide-react";

type ChatMessage = {
  id: string;
  fromUserId: string;
  toUserId: string;
  msg: string;
  createdAt: Date;
  isRead?: boolean;
  self?: boolean;
};

export default function GuestChatPopup() {
  const guestId = useGuestSession();
  console.log("Guest ID in GuestChatPopup:", guestId);
  const [admin, isAdminLoading, refreshAdmin] = useData(getAdmin, () => {});
  const [adminId, setAdminId] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isOpenRef = useRef(isOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Render message text with clickable links
  const renderWithLinks = (text: string) => {
    const urlPattern = /((https?:\/\/|www\.)[^\s]+)/gi;
    const parts = text.split(urlPattern);
    return parts.map((part, idx) => {
      if (!part) return null;
      const isLink = /(https?:\/\/|www\.)[^\s]+/i.test(part);
      if (isLink) {
        const href = part.startsWith("http") ? part : `https://${part}`;
        return (
          <a
            key={`lnk-${idx}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-red-600 hover:text-red-700 break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={`txt-${idx}`}>{part}</span>;
    });
  };

  useEffect(() => {
    if (admin) {
      setAdminId(admin);
    }
  }, [admin]);

  const [chatHistory, isFetchingChat, fetchChat] = useData(
    getGuestChat,
    () => {},
    adminId || ""
  );

  // action when guest read a message from admin
  const [readAction] = useMutation(readGuestMessages, () => {});

  useEffect(() => {
    if (chatHistory && guestId) {
      const formattedMessages = chatHistory.map((msg) => ({
        id: msg.id,
        fromUserId: msg.fromUserId ?? msg.fromGuestId ?? "",
        toUserId: msg.toUserId ?? msg.toGuestId ?? "",
        msg: msg.msg,
        createdAt: new Date(msg.createdAt),
        isRead: msg.isRead,
        self: msg.fromGuestId !== null, // Correctly identify messages sent by the guest
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [chatHistory, guestId]);

  const stableFetchChat = useCallback(fetchChat, []);
  const [unreadGuestCount, isUnreadLoading, fetchUnreadGuestCount] = useData(
    countUnreadMessagesForGuest,
    () => {},
    guestId || ""
  );

  // Seed unread badge from DB on load/refresh when chat is closed
  useEffect(() => {
    if (!guestId || isOpen) return;
    (async () => {
      try {
        fetchUnreadGuestCount();
      } catch (e) {
        console.error("Failed to get unread count:", e);
      }
    })();
  }, [guestId, isOpen, fetchUnreadGuestCount]);

  useEffect(() => {
    if (isOpen && guestId) {
      fetchChat();
      readAction(guestId);
      setUnreadCount(0);
    }
  }, [isOpen, guestId, stableFetchChat]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!guestId) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.error("Socket URL is not defined");
      return;
    }
    const newSocket = io(socketUrl, {
      query: { guestId },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(newSocket);

    const onConnect = () => {
      console.log("Socket connected for guest with ID:", guestId);
    };

    const onDisconnect = (reason: string) => {
      console.log("Socket disconnected. Reason:", reason);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    };

    const handleAdminMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      // If chat is closed and message from admin, bump unread badge
      if (!isOpenRef.current && !message.self) {
        setUnreadCount((c) => c + 1);
      }
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("chat_to_customer", handleAdminMessage);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("chat_to_customer", handleAdminMessage);
      newSocket.disconnect();
    };
  }, [guestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && unreadCount > 0 && guestId) {
        setUnreadCount(0);
        readAction(guestId);
      }
      return next;
    });
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !socket || !guestId || !adminId) return;

    // const userMessage: ChatMessage = {
    //   id: Date.now().toString(),
    //   fromUserId: guestId,
    //   toUserId: adminId,
    //   msg: newMessage,
    //   createdAt: new Date(),
    //   self: true,
    // };
    // setMessages((prev) => [...prev, userMessage]);

    socket.emit("chat_to_admin", {
      fromGuestId: guestId,
      toUserId: adminId,
      msg: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`w-80 h-96 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out border
          bg-white/90 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800
          ${
            isOpen
              ? "translate-y-0 opacity-100"
              : "hidden translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 rounded-t-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400">
          <h3 className="font-bold flex-1 text-center">Chat with Support</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs bg-white/15 px-2 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span>Online</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <>
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-neutral-950/40">
            <div className="space-y-3">
              {isFetchingChat || isAdminLoading ? (
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
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow
                        ${
                          msg.self
                            ? "bg-primary-600 dark:bg-primary-500 text-white rounded-br-none"
                            : "bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-neutral-700"
                        }`}
                    >
                      <p className="break-words">{renderWithLinks(msg.msg)}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-xs mt-1
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
                              <CheckCheck size={16} />
                            ) : (
                              <Check size={16} />
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
                disabled={!guestId || !adminId}
              />
              <button
                type="submit"
                className="p-2 rounded-full text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 transition-colors flex-shrink-0 disabled:bg-primary-400/60 disabled:cursor-not-allowed"
                aria-label="Send Message"
                disabled={!newMessage.trim() || !guestId || !adminId}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleChat}
        className="mt-4 float-right p-3 rounded-full text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 shadow-lg ring-2 ring-white/60 dark:ring-neutral-800 transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 relative"
        aria-label="Toggle Chat"
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-5 text-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
