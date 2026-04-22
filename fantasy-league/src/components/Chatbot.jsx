import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi Manager! I'm Coach AI. How can I help you dominate the IIITN Streaming Platform today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Connect to the mock AI endpoint we built in server.js
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { id: Date.now(), text: data.text || "I'm not sure about that.", sender: 'ai' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I lost connection to the server.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--neon-pink), #8a2be2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(255, 16, 122, 0.4)',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'scale(0.8)' : 'scale(1)'
        }}
      >
        {isOpen ? <X size={28} color="#fff" /> : <MessageCircle size={28} color="#fff" />}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '110px',
            right: '32px',
            width: '350px',
            height: '500px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderTop: '3px solid var(--neon-pink)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--neon-pink)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Bot size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Champak</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-green)' }}></span> Online
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  background: msg.sender === 'user' ? 'var(--neon-pink)' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '16px 16px 16px 0', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Champak is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.4)' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
            <button type="submit" disabled={!input.trim()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: input.trim() ? 'var(--neon-pink)' : 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', color: '#fff' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
