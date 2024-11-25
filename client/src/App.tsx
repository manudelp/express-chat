import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

interface Message {
  sender: string;
  text: string;
}

const App = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
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

    return () => {
      socket.off("welcome");
      socket.off("message");
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
      <h1 className="chat-header">Chat App</h1>
      <p className="chat-username">You are: {username}</p>
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
  );
};

export default App;
