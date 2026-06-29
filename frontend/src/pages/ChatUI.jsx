import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatUI = () => {
  const messagesEndRef = useRef(null);
  const [activeContact, setActiveContact] = useState({
    id: 1,
    name: 'Sarah Connor',
    role: 'Local Home Cleaner',
    avatar: 'SC',
  });

  const [contacts] = useState([
    { id: 1, name: 'Sarah Connor', role: 'Local Cleaner', avatar: 'SC', lastMsg: 'I can start at 10 AM.' },
    { id: 2, name: 'John Doe', role: 'Plumber', avatar: 'JD', lastMsg: 'Okay, I will replace the faucet.' },
    { id: 3, name: 'Michael Scott', role: 'Home Tutor', avatar: 'MS', lastMsg: 'No problem, see you tomorrow.' },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hello! I saw your booking request for tomorrow.', time: '04:15 PM' },
    { id: 2, sender: 'me', text: 'Hi! Yes, is the start time convenient for you?', time: '04:16 PM' },
    { id: 3, sender: 'them', text: 'Yes, 10 AM works perfectly. Do you have the cleaning supplies ready?', time: '04:18 PM' },
  ]);

  const [inputMsg, setInputMsg] = useState('');

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'me',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputMsg('');

    // Simulate reply after 1.5s
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'them',
          text: `Got it. Looking forward to completing the booking slot!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  return (
    <div className="glass rounded-3xl border border-slate-800 overflow-hidden h-[calc(100vh-140px)] flex shadow-2xl">
      {/* Left Contacts List */}
      <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/20">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="font-extrabold text-white text-lg flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Messages</span>
          </h3>
        </div>
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          {contacts.map(c => (
            <div 
              key={c.id} 
              onClick={() => setActiveContact(c)}
              className={`p-3.5 rounded-2xl flex items-center space-x-3 cursor-pointer transition ${activeContact.id === c.id ? 'bg-purple-600/10 border border-purple-500/20 text-white' : 'hover:bg-slate-900/60 text-slate-400'}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {c.avatar}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-slate-200">{c.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{c.role}</div>
                <div className="text-xs text-slate-400 truncate mt-1">{c.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Conversation Window */}
      <div className="w-2/3 flex flex-col justify-between bg-slate-950/40">
        {/* Active Contact Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
              {activeContact.avatar}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{activeContact.name}</div>
              <div className="text-[10px] text-purple-400 font-semibold uppercase">{activeContact.role}</div>
            </div>
          </div>
          <Link to="/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Messaging Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <div className="bg-purple-500/5 border border-purple-500/10 p-3 rounded-2xl text-[10px] text-slate-400 flex items-start space-x-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>Avoid sharing sensitive password credentials, bank credentials, or private addresses over direct messages. Real-time updates remain logged locally.</span>
          </div>

          {messages.map(m => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                m.sender === 'me' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {m.text}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800/80 bg-slate-950/20 flex gap-3">
          <input 
            type="text" 
            placeholder="Type your message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          />
          <button 
            type="submit"
            className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition shadow flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatUI;
