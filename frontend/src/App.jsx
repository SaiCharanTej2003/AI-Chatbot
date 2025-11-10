import React, { useState } from 'react';

function ChatMessage({ role, content }) {
  return (
    <div className={`message ${role}`}>
      <div className="role">{role}</div>
      <div className="content">{content}</div>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful virtual chatbot.' }
  ]);
  const [loading, setLoading] = useState(false);
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  async function sendMessage(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const resp = await fetch(`${backend}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'API error');
      const assistant = data.assistant || JSON.stringify(data.raw);
      setMessages(prev => [...prev, { role: 'assistant', content: assistant }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + String(err) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header><h1>AI Chatbot</h1></header>
      <main className="chat-window">
        <div className="messages">
          {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
        </div>
        <form className="composer" onSubmit={sendMessage}>
          <input
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  );
}
