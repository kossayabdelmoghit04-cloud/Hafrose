import React, { useState } from 'react';

const AiAssistantDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Bonjour. Je suis votre Concierge IA HAFROSE. Comment puis-je vous guider dans votre expérience ?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'assistant', text: data.data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'assistant', text: "Service conciergerie momentanément indisponible." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-700 to-amber-900 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-amber-400/30 flex items-center gap-2"
        aria-label="Ouvrir le Concierge IA"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
        </span>
        <span className="font-serif text-xs uppercase tracking-widest hidden md:inline">Concierge IA</span>
      </button>

      {/* Drawer Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-neutral-950 border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 to-amber-950 p-4 border-b border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center font-serif text-amber-400 text-xs font-bold">
                H
              </div>
              <div>
                <h4 className="font-serif text-sm text-amber-100">Concierge HAFROSE</h4>
                <p className="text-[10px] text-amber-400/80 uppercase tracking-wider">Assistant IA Privé</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white text-sm">
              ✕
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-900/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none'
                      : 'bg-neutral-800 border border-amber-900/30 text-amber-100 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-left text-[10px] text-amber-500 animate-pulse">Reflexion en cours...</div>}
          </div>

          {/* Input Form */}
          <form onSubmit={sendMessage} className="p-3 bg-neutral-900 border-t border-amber-900/30 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 bg-neutral-800 border border-neutral-700 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-amber-600"
            />
            <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2 rounded-lg font-semibold">
              Envoyer
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiAssistantDrawer;
