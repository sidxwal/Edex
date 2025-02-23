import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessageToBackend } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../styles/ChatPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"; // Send icon
import {
  faAlignRight,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
// import { faBars } from "@fortawesome/free-solid-svg-icons";

const ChatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats", user.uid, "sessions"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(sessionData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const startNewSession = async () => {
    if (!user) return;

    const sessionId = uuidv4();
    setCurrentSessionId(sessionId);
    setMessages([]);

    await addDoc(collection(db, "chats", user.uid, "sessions"), {
      sessionId: sessionId,
      createdAt: new Date(),
    });
  };

  useEffect(() => {
    if (!user || !currentSessionId) return;

    const q = query(
      collection(
        db,
        "chats",
        user.uid,
        "sessions",
        currentSessionId,
        "messages"
      ),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatHistory = snapshot.docs.map((doc) => doc.data());
      setMessages(chatHistory);
    });

    return () => unsubscribe();
  }, [user, currentSessionId]);

  const saveMessageToFirestore = async (message) => {
    if (!user || !currentSessionId) return;

    await addDoc(
      collection(
        db,
        "chats",
        user.uid,
        "sessions",
        currentSessionId,
        "messages"
      ),
      {
        sender: message.sender,
        text: message.text,
        timestamp: new Date(),
      }
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!currentSessionId) await startNewSession();

    // Add the user's message to the chat history
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    saveMessageToFirestore(userMessage);
    setInput("");
    setLoading(true);

    // Add a "Thinking" message to the chat history
    const thinkingMessage = {
      sender: "ai",
      text: "Thinking...",
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const response = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = { sender: "ai", text: "" };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        console.log("Received chunk:", chunk); // Debugging

        try {
          const data = JSON.parse(chunk.replace("data: ", ""));
          aiMessage.text += data.answer;

          // Update the chat history while preserving previous messages
          setMessages((prev) => {
            // Remove the "Thinking" message
            const messagesWithoutThinking = prev.filter(
              (msg) => !msg.isThinking
            );

            // Find the last AI message in the chat history
            const lastMessage =
              messagesWithoutThinking[messagesWithoutThinking.length - 1];
            if (lastMessage.sender === "ai") {
              // If the last message is from the AI, update it
              return [
                ...messagesWithoutThinking.slice(0, -1), // Keep all messages except the last one
                { ...lastMessage, text: aiMessage.text }, // Update the last AI message
              ];
            } else {
              // If the last message is not from the AI, append the new AI message
              return [...messagesWithoutThinking, aiMessage];
            }
          });
        } catch (error) {
          console.error("Error parsing chunk:", error);
        }
      }

      // Save the final AI message to Firestore
      saveMessageToFirestore(aiMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.isThinking), // Remove the "Thinking" message
        { sender: "ai", text: "Error: Unable to get response." },
      ]);
    }

    setLoading(false);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!user) return;

    const sessionRef = doc(db, "chats", user.uid, "sessions", sessionId);
    const messagesRef = collection(
      db,
      "chats",
      user.uid,
      "sessions",
      sessionId,
      "messages"
    );

    const messagesSnapshot = await getDocs(messagesRef);
    messagesSnapshot.forEach(async (messageDoc) => {
      await deleteDoc(doc(messagesRef, messageDoc.id));
    });

    await deleteDoc(sessionRef);

    setSessions(sessions.filter((session) => session.id !== sessionId));

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  return (
    <div className="chat-page">
      <div className="navbar">
        <div className="navbar-left">
          <h1>Edex</h1>
        </div>
        <div className="navbar-right">
          {/* About button remains visible on desktop */}
          <button
            className="about-dev"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/in/siddhant-khandelwal-ba196832a/",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            About the Developer
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="chat-section">
          <div className="chat-box">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h2>Welcome to your personalized learning session!</h2>
                <p>What would you like to explore today?</p>
                <div className="topics">
                  <button>Coding</button>
                  <button>Electronics</button>
                  <button>Literature</button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ))
            )}
            {loading && (
              <div className="chat-bubble ai" style={{ fontStyle: "italic" }}>
                <span className="loading-dots">Thinking</span>
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your learning question..."
              className="chat-input"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="send-button">
              <FontAwesomeIcon icon={faArrowRight} className="send-icon" />
            </button>
          </div>
        </div>

        {/* Sidebar Icon (Mobile Only) */}
        {isMobile && (
          <FontAwesomeIcon
            icon={faAlignRight}
            className="sidebar-toggle-icon"
            onClick={toggleSidebar}
          />
        )}

        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

          {/* User Profile Section */}
          <div className="user-profile">
            <div className="user-icon">
              <i className="fa-regular fa-user" style={{ fontSize: 20 }}></i>
            </div>
            <div className="user-info">
              <h3>{user?.displayName || "Learner"}</h3>
              <p className="user-status">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="status-icon"
                />{" "}
                The Intelligent Guy
              </p>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="new-chat">
            <button onClick={startNewSession} className="new-chat-button">
              <i className="fa-solid fa-square-plus"></i> New Chat
            </button>
          </div>

          {/* Previous Chat Sessions */}
          <ul className="chat-sessions">
            {sessions.map((session) => (
              <li key={session.id} className="chat-item">
                <button
                  onClick={() => setCurrentSessionId(session.sessionId)}
                  className={`chat-button ${
                    session.sessionId === currentSessionId ? "active" : ""
                  }`}
                >
                  {new Date(session.createdAt.seconds * 1000).toLocaleString()}
                </button>
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="delete-button"
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </li>
            ))}
          </ul>

          {/* Logout / End Session */}
          <button onClick={handleLogout} className="end-session">
            <i className="fa-solid fa-person-running"></i> End Learning Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
