"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useParams } from "next/navigation";
import { IMessage } from "@/models/Message";
import styles from "./Chat.module.css";
import { FiSend } from "react-icons/fi";
import { IoCheckmarkDone, IoCheckmark } from "react-icons/io5";

interface ContactInfo {
  name: string;
  number: string;
}

// Define the business's phone number from your webhook metadata
const BUSINESS_PHONE_NUMBER = "918329446654";

export default function ChatPage() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const params = useParams();
  const conversationId = params.conversationId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (conversationId) {
      async function fetchMessages() {
        const res = await fetch(`/api/messages/${conversationId}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
          setContactInfo(data.contactInfo);
        }
      }
      fetchMessages();
    }
  }, [conversationId]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: { body: newMessage },
        conversationId,
        profileName: contactInfo?.name || "Me",
        from: "me", // Keep this as 'me' for messages sent from the UI
      }),
    });

    if (res.ok) {
      const { message } = await res.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "read") return <IoCheckmarkDone color="#53bdeb" />;
    if (status === "delivered") return <IoCheckmarkDone />;
    return <IoCheckmark />;
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        {contactInfo && (
          <div>
            <div className={styles.chatName}>{contactInfo.name}</div>
            <div className={styles.chatNumber}>{contactInfo.number}</div>
          </div>
        )}
      </header>
      <main className={styles.messageArea}>
        {messages.map((msg) => {
          const isSent =
            msg.from === "me" || msg.from === BUSINESS_PHONE_NUMBER;

          return (
            <div
              key={msg._id as string}
              className={`${styles.messageBubble} ${
                isSent ? styles.sent : styles.received
              }`}
            >
              <p>{msg.text.body}</p>
              <div className={styles.messageInfo}>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isSent && (
                  <span className={styles.statusIcon}>
                    {getStatusIcon(msg.status)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>
      {/* *** FIX: Corrected the typo in the className from messageInputFoserm to messageInputForm *** */}
      <footer className={styles.messageInputForm}>
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button type="submit">
            <FiSend />
          </button>
        </form>
      </footer>
    </div>
  );
}
