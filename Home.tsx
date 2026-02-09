
import React, { useMemo } from 'react';
import { db } from '../services/db';
import { getRankByElo, User, CURRENT_SEASON, MEDALS_CONFIG } from '../types';

interface HomeProps {
  onNavigateProfile: (userId: number) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateProfile }) => {
  const users = db.getUsers();
  
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.elo - a.elo);
  }, [users]);

  const top5 = sortedUsers.slice(0, 5);

  const renderMedals = (userMedals: string[], limit: number = 3) => {
    const earned = MEDALS_CONFIG.filter(m => (userMedals || []).includes(m.id)).reverse();
    return (
      <div className="flex -space-x-1">
        {earned.slice(0, limit).map(medal => (
          <div 
            key={medal.id}
            title={medal.label}
            className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center shadow-sm"
            style={{ backgroundColor: medal.color, boxShadow: `0 0 5px ${medal.shadow}` }}
          >
            <svg className="w-2 h-2 text-black/80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6">
        <h1 className="text-6xl md:text-8xl font-kanit font-extrabold tracking-tighter uppercase leading-none">
          WHITE <span className="block text-red-600 text-glow-red">ESPORTS</span>
        </h1>
        <p className="max-w-xl mx-auto text-white/50 text-lg">
          Самая престижная соревновательная лига Standoff 2. 
          Идет <span className="text-red-500 font-bold">{CURRENT_SEASON} Сезон</span>.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {top5.map((player, index) => (
          <div 
            key={player.id}
            onClick={() => onNavigateProfile(player.id)}
            className={`cursor-pointer glass rounded-2xl p-6 flex flex-col items-center gap-3 transition-all hover:scale-105 border-white/10 ${index === 0 ? 'ring-2 ring-red-600 bg-red-600/5 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'hover:border-red-600/40'} ${player.isBanned ? 'opacity-60 grayscale' : ''}`}
          >
            <div className="relative">
              <img 
                src={player.avatarUrl || `https://picsum.photos/seed/${player.nickname}/200/200`} 
                alt={player.nickname}
                className="w-20 h-20 rounded-full object-cover border-2 border-red-600/30"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white font-bold flex items-center justify-center rounded-full text-xs shadow-lg">
                #{index + 1}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                {renderMedals(player.medals, 3)}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg leading-tight truncate max-w-[120px]">{player.nickname}</h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">UID: {player.id}</p>
            </div>
            <div className="w-full h-px bg-white/10 my-1"></div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-kanit font-bold text-white">{player.elo}</span>
              <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">{getRankByElo(player.elo)}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-kanit font-bold uppercase tracking-tight">Таблица лидеров</h2>
          <span className="text-white/30 text-sm">{sortedUsers.length} Игроков в лиге</span>
        </div>
        
        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-widest bg-white/[0.01]">
                <th className="px-8 py-5 font-medium">UID</th>
                <th className="px-8 py-5 font-medium">Игрок</th>
                <th className="px-8 py-5 font-medium text-center">Матчи</th>
                <th className="px-8 py-5 font-medium text-right">Эло</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, idx) => (
                <tr 
                  key={user.id} 
                  onClick={() => onNavigateProfile(user.id)}
                  className={`border-b border-white/5 hover:bg-red-600/[0.03] transition-colors cursor-pointer group ${user.isBanned ? 'opacity-40 grayscale pointer-events-none bg-red-900/5' : ''}`}
                >
                  <td className="px-8 py-5 font-kanit font-bold text-xl text-white/10 group-hover:text-red-600 transition-colors">
                    {user.id.toString().padStart(2, '0')}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-white/10 flex-shrink-0 group-hover:ring-2 ring-red-600 transition-all overflow-hidden relative">
                        <img 
                          src={user.avatarUrl || `https://picsum.photos/seed/${user.nickname}/100/100`} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold group-hover:text-red-400 transition-colors flex items-center gap-2">
                          {user.nickname}
                          {user.isBanned && <span className="text-[8px] bg-red-600 text-white px-1 py-0.5 rounded font-bold uppercase">BANNED</span>}
                          {renderMedals(user.medals, 2)}
                        </div>
                        <div className="text-xs text-white/40">ID SO2: {user.so2Id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center text-white/60 font-medium">
                    {user.matchesPlayed}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-lg text-white group-hover:text-red-500 transition-colors">{user.elo}</span>
                      <span className="text-[10px] uppercase text-red-600/60 font-bold">{getRankByElo(user.elo)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedUsers.length === 0 && (
            <div className="py-20 text-center text-white/10 uppercase tracking-[0.3em] font-kanit">Список пуст</div>
          )}
        </div>
      </section>
    </div>
  );
};
