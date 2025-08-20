"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "agent";
}

export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! How can we help you with your property search?",
      sender: "agent",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    setMessages([...messages, { text: newMessage, sender: "user" }]);
    setNewMessage("");

    // Simulate an agent's response after a short delay
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Thanks for your message! An agent will be with you shortly.",
          sender: "agent",
        },
      ]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div
        className={`w-80 h-96 bg-white rounded-lg shadow-2xl  flex-col transition-all duration-300 ease-in-out ${
          isOpen
            ? "flex translate-y-0"
            : "hidden translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-bold">Chat with an Agent</h3>
          <button
            onClick={toggleChat}
            className="hover:bg-blue-700 p-1 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-gray-50 rounded-b-lg">
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
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors flex-shrink-0"
              aria-label="Send Message"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
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
