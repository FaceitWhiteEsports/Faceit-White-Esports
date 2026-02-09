
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, getRankByElo, CURRENT_SEASON, Ticket, TicketStatus, TicketMessage } from '../types';

type AdminTab = 'users' | 'tickets';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState<TicketStatus | 'ALL'>('ALL');

  // Modals / Selection
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: any, nickname?: string, isTicket?: boolean } | null>(null);

  // User editing states
  const [editingElo, setEditingElo] = useState<{ id: number, value: string } | null>(null);
  const [editingMatches, setEditingMatches] = useState<{ id: number, value: string } | null>(null);

  useEffect(() => {
    setUsers(db.getUsers());
    setTickets(db.getTickets());
    
    const handleStorage = () => {
      setUsers(db.getUsers());
      setTickets(db.getTickets());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // --- USER ACTIONS ---
  const handleUpdateElo = (user: User) => {
    if (!editingElo) return;
    const newElo = parseInt(editingElo.value);
    if (isNaN(newElo)) return;
    const updatedSeasonalStats = { ...user.seasonalStats };
    updatedSeasonalStats[CURRENT_SEASON] = { ...(updatedSeasonalStats[CURRENT_SEASON] || { matchesPlayed: user.matchesPlayed }), elo: newElo };
    db.updateUser({ ...user, elo: newElo, seasonalStats: updatedSeasonalStats });
    setUsers(db.getUsers());
    setEditingElo(null);
  };

  const handleUpdateMatches = (user: User) => {
    if (!editingMatches) return;
    const newMatches = parseInt(editingMatches.value);
    if (isNaN(newMatches)) return;
    const updatedSeasonalStats = { ...user.seasonalStats };
    updatedSeasonalStats[CURRENT_SEASON] = { ...(updatedSeasonalStats[CURRENT_SEASON] || { elo: user.elo }), matchesPlayed: newMatches };
    db.updateUser({ ...user, matchesPlayed: newMatches, seasonalStats: updatedSeasonalStats });
    setUsers(db.getUsers());
    setEditingMatches(null);
  };

  const handleToggleBan = (user: User) => {
    if (['xeemplee', 'qut3guap'].includes(user.username.toLowerCase())) {
      alert("Нельзя забанить администратора!"); return;
    }
    db.updateUser({ ...user, isBanned: !user.isBanned });
    setUsers(db.getUsers());
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.isTicket) {
      db.deleteTicket(deleteConfirm.id);
      setSelectedTicket(null);
    } else {
      db.deleteUser(deleteConfirm.id);
    }
    setDeleteConfirm(null);
    setUsers(db.getUsers());
    setTickets(db.getTickets());
  };

  // --- TICKET ACTIONS ---
  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    const newMessage: TicketMessage = { sender: 'ADMIN', text: replyText.trim(), timestamp: Date.now(), isAdmin: true };
    const updatedTicket = { ...selectedTicket, messages: [...selectedTicket.messages, newMessage] };
    db.updateTicket(updatedTicket);
    setSelectedTicket(updatedTicket);
    setReplyText('');
  };

  const updateTicketStatus = (id: string, status: TicketStatus) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      const updated = { ...ticket, status };
      db.updateTicket(updated);
      setTickets(db.getTickets());
      if (selectedTicket?.id === id) setSelectedTicket(updated);
    }
  };

  // --- FILTERING ---
  const filteredUsers = users.filter(u => {
    const s = searchTerm.toLowerCase();
    return u.nickname.toLowerCase().includes(s) || u.so2Id.includes(s) || u.username.toLowerCase().includes(s);
  });

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.reporterNickname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = ticketFilter === 'ALL' || t.status === ticketFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case TicketStatus.REVIEWED: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case TicketStatus.CLOSED: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-white/10 text-white/40';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative pb-20">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setDeleteConfirm(null)}></div>
          <div className="glass-red relative w-full max-w-md p-8 rounded-[32px] border-red-600/30 shadow-2xl animate-in zoom-in-95 duration-300 text-center space-y-6">
            <h3 className="text-2xl font-kanit font-bold uppercase">Подтверждение</h3>
            <p className="text-white/60 text-sm">Вы уверены, что хотите удалить {deleteConfirm.isTicket ? 'этот тикет' : `игрока ${deleteConfirm.nickname}`}?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-600 text-white font-bold uppercase rounded-2xl active:scale-95">Да, удалить</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full py-4 bg-white/5 text-white/40 font-bold uppercase rounded-2xl active:scale-95">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-kanit font-bold uppercase text-red-600">Админ Панель</h1>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              Игроки ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'tickets' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              Тикеты ({tickets.length})
            </button>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {activeTab === 'tickets' && (
            <select 
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none text-white/60"
            >
              <option value="ALL">Все статусы</option>
              <option value={TicketStatus.PENDING}>На рассмотрении</option>
              <option value={TicketStatus.REVIEWED}>Рассмотренные</option>
              <option value={TicketStatus.CLOSED}>Закрытые</option>
            </select>
          )}
          <input 
            type="text" 
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600/50"
          />
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="glass rounded-[40px] overflow-hidden border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/30 text-[10px] uppercase tracking-widest bg-red-600/5">
                  <th className="px-8 py-6">Игрок</th>
                  <th className="px-8 py-6">Ранг & S{CURRENT_SEASON}</th>
                  <th className="px-8 py-6 text-center">Управление</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={`border-b border-white/5 hover:bg-white/[0.01] transition-colors ${user.isBanned ? 'bg-red-950/10' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={user.avatarUrl} className="w-10 h-10 rounded-lg border border-white/10 object-cover" alt="" />
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {user.nickname}
                            {['xeemplee', 'qut3guap'].includes(user.username.toLowerCase()) && <span className="bg-red-600 text-[8px] px-1.5 py-0.5 rounded font-black uppercase">STAFF</span>}
                          </div>
                          <div className="text-[10px] text-white/20 uppercase tracking-tighter">UID: {user.id} • ID SO2: {user.so2Id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{user.elo}</span>
                        <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold">{getRankByElo(user.elo)}</span>
                        <span className="text-[9px] text-white/20">({user.matchesPlayed} м)</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center items-center gap-2">
                        {editingElo?.id === user.id ? (
                          <input 
                            autoFocus type="number" value={editingElo.value}
                            onChange={(e) => setEditingElo({ id: user.id, value: e.target.value })}
                            onBlur={() => handleUpdateElo(user)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateElo(user)}
                            className="w-16 bg-black/40 border border-red-600/50 rounded-lg px-2 py-1 text-xs outline-none"
                          />
                        ) : (
                          <button onClick={() => setEditingElo({ id: user.id, value: user.elo.toString() })} className="px-3 py-1.5 rounded-lg bg-red-600/10 border border-red-600/20 text-[9px] uppercase font-bold text-red-500">ЭЛО</button>
                        )}
                        
                        {editingMatches?.id === user.id ? (
                          <input 
                            autoFocus type="number" value={editingMatches.value}
                            onChange={(e) => setEditingMatches({ id: user.id, value: e.target.value })}
                            onBlur={() => handleUpdateMatches(user)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateMatches(user)}
                            className="w-16 bg-black/40 border border-red-600/50 rounded-lg px-2 py-1 text-xs outline-none"
                          />
                        ) : (
                          <button onClick={() => setEditingMatches({ id: user.id, value: user.matchesPlayed.toString() })} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] uppercase font-bold text-white/40">Матчи</button>
                        )}

                        <button onClick={() => handleToggleBan(user)} className={`px-4 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${user.isBanned ? 'bg-white/10 text-white' : 'bg-red-600 text-white border-red-600'}`}>
                          {user.isBanned ? 'Разбанить' : 'Бан'}
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ id: user.id, nickname: user.nickname })}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-red-600 group transition-all"
                        >
                          <svg className="w-4 h-4 text-white/20 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/20 px-2">Все обращения</h3>
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`glass p-5 rounded-3xl cursor-pointer transition-all border border-white/5 hover:border-red-600/30 ${selectedTicket?.id === ticket.id ? 'bg-red-600/5 border-red-600/30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold text-white/30">{ticket.id}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                  </div>
                  <h4 className="font-bold text-sm truncate">{ticket.title}</h4>
                  <div className="flex justify-between mt-1 text-[10px] text-white/40">
                    <span>От: {ticket.reporterNickname}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && <div className="text-center py-10 opacity-10 font-bold uppercase text-xs">Тикетов не найдено</div>}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedTicket ? (
              <div className="glass rounded-[40px] overflow-hidden border-white/5 flex flex-col h-[700px]">
                <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-kanit font-bold uppercase">{selectedTicket.title}</h3>
                    <p className="text-xs text-white/40 mt-1">Отправитель: <span className="text-white font-bold">{selectedTicket.reporterNickname}</span> (UID: {selectedTicket.reporterId})</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateTicketStatus(selectedTicket.id, TicketStatus.REVIEWED)} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-500/20">Рассмотрен</button>
                    <button onClick={() => updateTicketStatus(selectedTicket.id, TicketStatus.CLOSED)} className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-600 border border-red-600/20 text-[9px] font-bold uppercase tracking-widest hover:bg-red-600/20">Закрыть</button>
                    <button onClick={() => setDeleteConfirm({ id: selectedTicket.id, isTicket: true })} className="p-2 bg-white/5 rounded-lg hover:bg-red-600 transition-all text-white/40 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/5 mb-8">
                    <p className="text-[10px] uppercase font-bold text-red-500 mb-2">Суть жалобы (на {selectedTicket.reportedNickname}):</p>
                    <p className="text-sm leading-relaxed text-white/80">{selectedTicket.description}</p>
                    {selectedTicket.proof && <p className="mt-4 text-[10px] text-white/30 uppercase">Пруфы: <a href={selectedTicket.proof} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{selectedTicket.proof}</a></p>}
                  </div>

                  {selectedTicket.messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                      <span className={`text-[9px] uppercase font-bold mb-1 ${msg.isAdmin ? 'text-red-500' : 'text-white/40'}`}>{msg.isAdmin ? 'ВЫ (АДМИН)' : msg.sender}</span>
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm ${msg.isAdmin ? 'bg-red-600 text-white' : 'bg-white/5 border border-white/10 text-white/90'}`}>{msg.text}</div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-white/5 bg-black/40">
                  <form onSubmit={handleTicketReply} className="flex gap-3">
                    <input 
                      type="text" placeholder="Ваш ответ игроку..." value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-red-600/50 text-sm"
                    />
                    <button type="submit" disabled={!replyText.trim()} className="h-14 w-32 bg-red-600 text-white font-bold uppercase text-xs rounded-2xl hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all">Ответить</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] glass rounded-[40px] flex flex-col items-center justify-center text-center p-12 opacity-30">
                <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <h3 className="text-2xl font-kanit font-bold uppercase">Тикет не выбран</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
