"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Home.module.css";

interface Conversation {
  _id: string;
  profileName: string;
  lastMessage: string;
  timestamp: string;
}

// FIX: Renamed function from 'page' to 'Page'
export default function Page() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    async function fetchConversations() {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    }
    fetchConversations();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Chats</h1>
      </header>
      <div className={styles.chatList}>
        {conversations.map((convo) => (
          <Link
            href={`/chat/${convo._id}`}
            key={convo._id}
            className={styles.link}
          >
            <div className={styles.chatItem}>
              <div className={styles.avatar}>{convo.profileName.charAt(0)}</div>
              <div className={styles.chatDetails}>
                <div className={styles.chatHeader}>
                  <span className={styles.profileName}>
                    {convo.profileName}
                  </span>
                  <span className={styles.timestamp}>
                    {new Date(convo.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className={styles.lastMessage}>{convo.lastMessage}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
