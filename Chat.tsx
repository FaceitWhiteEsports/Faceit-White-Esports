
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { User, ChatMessage } from '../types';

interface ChatProps {
  currentUser: User | null;
}

export const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    // db.getChatMessages фильтрует сообщения старше 5 минут внутри себя
    const freshMessages = db.getChatMessages();
    setMessages(freshMessages);
  };

  useEffect(() => {
    loadMessages();
    
    // Слушаем изменения из других вкладок
    window.addEventListener('storage', loadMessages);

    // Интервал обновления каждые 10 секунд для мгновенной очистки "в эфире"
    const liveUpdate = setInterval(loadMessages, 10000);

    return () => {
      window.removeEventListener('storage', loadMessages);
      clearInterval(liveUpdate);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !inputText.trim() || cooldown > 0) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      nickname: currentUser.nickname,
      text: inputText.trim(),
      timestamp: Date.now(),
      isAdmin: ['xeemplee', 'qut3guap'].includes(currentUser.username.toLowerCase())
    };

    db.saveChatMessage(newMessage);
    loadMessages();
    setInputText('');
    setCooldown(5);
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto h-[600px] flex items-center justify-center text-center px-6">
        <div className="glass p-12 rounded-[40px] border-red-900/10 space-y-6">
          <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-3xl font-kanit font-bold uppercase">Доступ ограничен</h2>
          <p className="text-white/40 text-sm max-w-xs mx-auto">Только зарегистрированные игроки Faceit White могут читать и писать в чат.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[700px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-kanit font-bold uppercase tracking-tight">Чат Лиги <span className="text-red-600">LIVE</span></h2>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-white/20 tracking-widest">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Сообщений: {messages.length} / 50
        </div>
      </div>

      <div className="flex-grow glass rounded-[32px] border-white/5 overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/[0.02] to-transparent pointer-events-none"></div>
        
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/5 space-y-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <p className="uppercase font-kanit font-bold tracking-[0.3em] text-center">Чат пуст<br/><span className="text-[10px] font-medium opacity-50">Сообщения живут 5 минут</span></p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.userId === currentUser.id ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex items-center gap-2 mb-1 px-1`}>
                  <span className="text-[10px] font-bold uppercase text-white/40 tracking-tighter">
                    {msg.nickname}
                    {msg.isAdmin && <span className="ml-1.5 text-red-500 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20 text-[8px]">ADMIN</span>}
                  </span>
                  <span className="text-[8px] text-white/10">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.userId === currentUser.id 
                    ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-600/10' 
                    : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
            <input 
              type="text" 
              maxLength={200}
              placeholder={cooldown > 0 ? `Антиспам: ${cooldown}с` : "Ваше сообщение..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={cooldown > 0}
              className={`w-full bg-white/5 border rounded-2xl px-6 py-4 focus:outline-none transition-all placeholder:text-white/20 text-sm ${
                cooldown > 0 ? 'border-transparent cursor-not-allowed opacity-50' : 'border-white/10 focus:border-red-600/50'
              }`}
            />
            <button 
              type="submit"
              disabled={cooldown > 0 || !inputText.trim()}
              className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
                cooldown > 0 || !inputText.trim() 
                  ? 'bg-white/5 text-white/10 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:scale-105 active:scale-95 shadow-red-600/20'
              }`}
            >
              {cooldown > 0 ? (
                <span className="font-bold text-xs">{cooldown}</span>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              )}
            </button>
          </form>
          <div className="mt-3 flex justify-between items-center text-[9px] uppercase font-bold tracking-widest text-white/10 px-1">
            <span>Задержка 5 сек</span>
            <span>Авто-очистка: 5 мин</span>
          </div>
        </div>
      </div>
    </div>
  );
};
