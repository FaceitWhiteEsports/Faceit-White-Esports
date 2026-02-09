
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, Ticket, TicketStatus, TicketMessage } from '../types';

interface TicketsProps {
  currentUser: User | null;
}

export const Tickets: React.FC<TicketsProps> = ({ currentUser }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    reportedNickname: '',
    description: '',
    proof: ''
  });

  useEffect(() => {
    if (currentUser) {
      const allTickets = db.getTickets();
      setTickets(allTickets.filter(t => t.reporterId === currentUser.id));
    }
    
    const handleStorage = () => {
      if (currentUser) {
        const allTickets = db.getTickets();
        setTickets(allTickets.filter(t => t.reporterId === currentUser.id));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentUser]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newTicket: Ticket = {
      id: 'T-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      title: formData.title,
      reporterId: currentUser.id,
      reporterNickname: currentUser.nickname,
      reportedNickname: formData.reportedNickname,
      description: formData.description,
      proof: formData.proof,
      status: TicketStatus.PENDING,
      createdAt: Date.now(),
      messages: []
    };

    db.saveTicket(newTicket);
    setIsCreating(false);
    setFormData({ title: '', reportedNickname: '', description: '', proof: '' });
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || !currentUser) return;

    const newMessage: TicketMessage = {
      sender: currentUser.nickname,
      text: replyText.trim(),
      timestamp: Date.now(),
      isAdmin: false
    };

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage]
    };

    db.updateTicket(updatedTicket);
    setSelectedTicket(updatedTicket);
    setReplyText('');
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto h-[600px] flex flex-col items-center justify-center text-center px-6">
        <div className="glass p-12 rounded-[40px] border-red-900/10 space-y-6">
          <h2 className="text-3xl font-kanit font-bold uppercase">Авторизация</h2>
          <p className="text-white/40 text-sm">Войдите, чтобы создавать репорты и общаться с поддержкой.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case TicketStatus.REVIEWED: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case TicketStatus.CLOSED: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-white/10 text-white/40';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-kanit font-extrabold uppercase tracking-tight">Центр <span className="text-red-600 text-glow-red">Поддержки</span></h2>
          <p className="text-white/30 text-xs uppercase font-bold tracking-widest mt-1">Ваши обращения и жалобы</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-8 py-3 bg-red-600 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
        >
          Создать тикет
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tickets List */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/20 px-2">Список тикетов</h3>
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="glass p-8 rounded-3xl text-center border-white/5">
                <p className="text-xs text-white/20 uppercase font-bold">Нет обращений</p>
              </div>
            ) : (
              tickets.sort((a,b) => b.createdAt - a.createdAt).map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`glass p-5 rounded-3xl cursor-pointer transition-all border border-white/5 hover:border-red-600/30 group ${selectedTicket?.id === ticket.id ? 'bg-red-600/5 ring-1 ring-red-600/40 border-red-600/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">{ticket.id}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm group-hover:text-red-500 transition-colors mb-1 truncate">{ticket.title}</h4>
                  <p className="text-[10px] text-white/40">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="md:col-span-2">
          {selectedTicket ? (
            <div className="glass rounded-[32px] overflow-hidden border-white/5 flex flex-col h-[650px] animate-in slide-in-from-right-4 duration-300">
              <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-kanit font-bold uppercase">{selectedTicket.title}</h3>
                    <p className="text-xs text-white/40 mt-1">Жалоба на: <span className="text-red-500 font-bold">{selectedTicket.reportedNickname}</span></p>
                  </div>
                  <div className={`px-4 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </div>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-sm text-white/70 leading-relaxed mb-4">
                  {selectedTicket.description}
                </div>
                {selectedTicket.proof && (
                  <div className="text-[10px] uppercase font-bold text-white/30">
                    Доказательства: <a href={selectedTicket.proof} target="_blank" rel="noreferrer" className="text-red-500 hover:underline ml-1 truncate inline-block max-w-xs align-bottom">{selectedTicket.proof}</a>
                  </div>
                )}
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {selectedTicket.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <p className="font-kanit font-bold uppercase tracking-widest">Ожидайте ответа</p>
                  </div>
                ) : (
                  selectedTicket.messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'} animate-in fade-in duration-300`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${msg.isAdmin ? 'text-red-500' : 'text-white/40'}`}>
                          {msg.isAdmin ? 'Администратор' : msg.sender}
                        </span>
                        <span className="text-[8px] text-white/10">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm ${msg.isAdmin ? 'bg-white/5 border border-red-600/30 text-white/90 rounded-tl-none' : 'bg-red-600 text-white rounded-tr-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedTicket.status !== TicketStatus.CLOSED && (
                <div className="p-6 bg-black/20 border-t border-white/5">
                  <form onSubmit={handleReply} className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Напишите ответ..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-600/50 text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!replyText.trim()}
                      className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[500px] glass rounded-[32px] border-white/5 flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center text-red-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
              </div>
              <div>
                <h3 className="text-2xl font-kanit font-bold uppercase">Выберите тикет</h3>
                <p className="text-white/30 text-sm max-w-xs mx-auto">Чтобы просмотреть детали обращения или написать администратору, выберите тикет из списка слева.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsCreating(false)}></div>
          <div className="glass relative w-full max-w-lg p-10 rounded-[40px] border-red-600/20 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-kanit font-extrabold uppercase mb-6">Новый <span className="text-red-600">Тикет</span></h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/30 ml-2">Тема обращения</label>
                <input 
                  required
                  type="text" 
                  placeholder="Напр: Жалоба на игрока, Проблема с ЭЛО"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-red-600/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/30 ml-2">Ник нарушителя (если репорт)</label>
                <input 
                  type="text" 
                  placeholder="Никнейм в игре"
                  value={formData.reportedNickname}
                  onChange={(e) => setFormData({...formData, reportedNickname: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-red-600/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/30 ml-2">Описание</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Подробно опишите вашу проблему..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-red-600/50 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/30 ml-2">Доказательства (ссылка)</label>
                <input 
                  type="url" 
                  placeholder="https://imgur.com/... или ссылка на YouTube"
                  value={formData.proof}
                  onChange={(e) => setFormData({...formData, proof: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-red-600/50"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-red-600 text-white font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/20 active:scale-95 transition-all">Отправить</button>
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-white/5 text-white/40 font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
