import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

// Access the socket URL from the environment variable
const socket = io(
  import.meta.env.VITE_APP_SOCKET_URL || "http://localhost:5000"
);

interface Message {
  sender: string;
  text: string;
}

const App = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [online, setOnline] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Get the username assigned by the server
    socket.on("welcome", (data) => {
      setUsername(data.username);
    });

    // Listen for messages from the server
    socket.on("message", (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Listen for the online users count from the server
    socket.on("online", (count: number) => {
      setOnline(count);
    });

    return () => {
      socket.off("welcome");
      socket.off("message");
      socket.off("online");
    };
  }, []);

  useEffect(() => {
    // Scroll to the last message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (message.trim()) {
      // Send message to the server
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">
        Chat App{" "}
        <a
          href="https://www.linkedin.com/in/manuel-delpino/"
          style={{ fontSize: "50%" }}
        >
          by Manuel Delpino
        </a>
      </h1>
      <div className="chat-header">
        <p className="chat-username">
          {socket.connected ? `You are: ${username}` : ""}
        </p>
        <p className="chat-username" title="Online users">
          {online > 0 ? "🟢" : socket.connected ? "🔴" : "🛑"}
          {socket.connected ? online : "Offline"}
        </p>
      </div>
      <div className="chat-chat">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default App;
