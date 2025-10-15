"use state"
import { useState } from "react";
import { useRouter } from "next/router";

export default function ConversationPage() {
  const router = useRouter();
  const { conversationsIds } = router.query;
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input },
      { sender: "bot", text: `You said: ${input}` },
    ]);
    setInput("");
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Chatbot</h1>
      <div className="border rounded p-4 mb-4 bg-white min-h-[200px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
          >
            <span className={msg.sender === "user" ? "text-blue-600" : "text-gray-800"}>
              {msg.sender === "user" ? "You: " : "Bot: "}
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
    </div>
  );
}
