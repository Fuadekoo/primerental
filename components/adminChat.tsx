"use client";
import useAction from "@/hooks/useActions";
// import useGuestSession from "@/hooks/useGuestSession";
import {
  getAdminChat,
  getGuestList,
  getLoginUserId,
} from "@/actions/common/chat";
import io, { Socket } from "socket.io-client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, ArrowLeft } from "lucide-react";

// Use the new, more detailed message type
type ChatMessage = {
  id: string;
  fromUserId: string; // Can be guestId or adminId
  toUserId: string; // Can be guestId or adminId
  msg: string;
  createdAt: Date;
  self?: boolean;
};

export default function ChatPopup() {
  //   const guestId = useGuestSession();
  const [user, isUserRefresh, isLoading] = useAction(getLoginUserId, [
    true,
    () => {},
  ]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // Update state to use the new ChatMessage type
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectGuestId, setSelectGuestId] = useState<string | null>(null);
  console.log("Selected Guest ID in AdminChatPopup:", selectGuestId);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  // Action to get the admin user to message
  const [guestList, isRefreshList, isLoadingGuestList] = useAction(
    getGuestList,
    [true, () => {}]
  );

  // Action to get existing chat messages
  const [chatHistory, fetchChat, isFetchingChat] = useAction(getAdminChat, [
    ,
    () => {},
  ]);

  useEffect(() => {
    if (chatHistory && userId) {
      const formattedMessages = chatHistory.map((msg: any) => ({
        id: msg.id,
        fromUserId: msg.fromUserId ?? msg.fromGuestId, // Keep original IDs
        toUserId: msg.toUserId ?? msg.toGuestId,
        msg: msg.msg,
        createdAt: new Date(msg.createdAt),
        self: msg.fromUserId === userId, // Message is "self" if from admin
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
      // Fetch chat history once connected
      //   fetchChat(userId);
    };

    const onDisconnect = (reason: string) => {
      console.log("Socket disconnected. Reason:", reason);
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    };

    // Handle incoming messages for the admin
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
      } else {
        console.log("ELSE : ", message);
      }
    };

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("chat_to_admin", handleAdminMessage);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("chat_to_admin", handleAdminMessage);
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div
        className={`w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "hidden translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-lg">
          {selectGuestId && (
            <button
              onClick={handleBackToGuestList}
              className="hover:bg-blue-700 p-1 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h3 className="font-bold flex-1 text-center">
            {selectGuestId ? "Chat with Guest" : "Select a Guest"}
          </h3>
          <button
            onClick={toggleChat}
            className="hover:bg-blue-700 p-1 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {selectGuestId ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {isFetchingChat ? (
                  <div className="text-center text-gray-500">
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
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow ${
                          msg.self
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p>{msg.msg}</p>
                        <div
                          className={`text-xs mt-1 text-right ${
                            msg.self ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={!selectGuestId}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors flex-shrink-0 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  aria-label="Send Message"
                  disabled={!newMessage.trim() || !selectGuestId}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {isLoadingGuestList ? (
              <div className="p-3 text-center text-gray-500">
                Loading guests...
              </div>
            ) : (
              guestList?.map((guest: any) => (
                <div
                  key={guest.id}
                  onClick={() => setSelectGuestId(guest.guestId)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                >
                  <p className="font-semibold">{guest.name || "Guest"}</p>
                  <p className="text-sm text-gray-500">{guest.guestId}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="mt-4 float-right p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform duration-200 hover:scale-110"
        aria-label="Toggle Chat"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
