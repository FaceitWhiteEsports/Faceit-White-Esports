
import React, { useState } from 'react';
import { User, getRankByElo, CURRENT_SEASON, MEDALS_CONFIG } from '../types';
import { db } from '../services/db';

interface ProfileProps {
  user: User;
  isOwnProfile?: boolean;
  onUpdateUser?: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, isOwnProfile, onUpdateUser }) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user.avatarUrl || '');

  const seasonData = user.seasonalStats[CURRENT_SEASON] || { elo: user.elo, matchesPlayed: user.matchesPlayed };
  const rank = getRankByElo(seasonData.elo);

  const handleAvatarUpdate = () => {
    const updatedUser = { ...user, avatarUrl: newAvatarUrl };
    db.updateUser(updatedUser);
    if (onUpdateUser) onUpdateUser(updatedUser);
    setIsEditingAvatar(false);
  };

  const earnedMedals = MEDALS_CONFIG.filter(m => (user.medals || []).includes(m.id));

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {user.isBanned && (
        <div className="w-full bg-red-600 text-white py-3 px-6 rounded-2xl font-bold uppercase tracking-widest text-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
          Этот аккаунт заблокирован администрацией
        </div>
      )}

      <div className={`glass rounded-[40px] p-8 md:p-12 relative overflow-hidden border-red-900/10 ${user.isBanned ? 'grayscale opacity-70 border-red-600/50' : ''}`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:text-left text-center">
          <div className="relative inline-block group">
            <img 
              src={user.avatarUrl || `https://picsum.photos/seed/${user.nickname}/400/400`} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-red-600/20 shadow-2xl transition-all group-hover:brightness-50"
              alt={user.nickname}
            />
            {isOwnProfile && !user.isBanned && (
              <button 
                onClick={() => setIsEditingAvatar(true)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs uppercase"
              >
                Сменить фото
              </button>
            )}
            <div className="absolute bottom-2 right-1/2 translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
              UID: {user.id}
            </div>
          </div>

          <div className="space-y-4 flex-grow">
            <div className="space-y-1">
              <h2 className="text-4xl font-kanit font-extrabold tracking-tight uppercase text-glow-red">{user.nickname}</h2>
              <p className="text-white/40 font-medium tracking-wide">ID SO2: {user.so2Id} • @{user.username}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {earnedMedals.length > 0 ? (
                earnedMedals.map(medal => (
                  <div 
                    key={medal.id}
                    title={medal.label}
                    className="w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:scale-110"
                    style={{ 
                      borderColor: `${medal.color}40`, 
                      backgroundColor: `${medal.color}10`,
                      boxShadow: `0 0 10px ${medal.shadow}`
                    }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={medal.color}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                ))
              ) : (
                <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest">Нет медалей</span>
              )}
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Статистика {CURRENT_SEASON} Сезона</span>
            </div>
          </div>
        </div>

        {isEditingAvatar && (
          <div className="mt-8 flex flex-col gap-2 max-w-xs mx-auto md:mx-0 animate-in zoom-in-95 text-center md:text-left">
            <input 
              type="text" 
              placeholder="Ссылка на аватар (URL)"
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            <div className="flex gap-2">
              <button onClick={handleAvatarUpdate} className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase">Сохранить</button>
              <button onClick={() => setIsEditingAvatar(false)} className="flex-1 bg-white/5 py-1.5 rounded-lg text-[10px] font-bold uppercase">Отмена</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <div className="glass bg-white/[0.01] rounded-3xl p-6 text-center border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Эло</p>
            <p className="text-3xl font-kanit font-bold text-red-500">{seasonData.elo}</p>
          </div>
          <div className="glass bg-white/[0.01] rounded-3xl p-6 text-center border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Ранг</p>
            <p className="text-xl font-kanit font-bold text-white truncate">{rank}</p>
          </div>
          <div className="glass bg-white/[0.01] rounded-3xl p-6 text-center border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Матчей</p>
            <p className="text-3xl font-kanit font-bold text-white">{seasonData.matchesPlayed}</p>
          </div>
          <div className="glass bg-white/[0.01] rounded-3xl p-6 text-center border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">В лиге с</p>
            <p className="text-lg font-kanit font-bold pt-1 text-white">{new Date(user.joinedAt).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
      </div>

      {/* Медали (подробно) */}
      <div className="glass rounded-[40px] p-8 border-white/5">
        <h3 className="text-xl font-kanit font-bold uppercase mb-6 tracking-tight">Достижения Лиги</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4">
          {MEDALS_CONFIG.map(medal => {
            const isEarned = (user.medals || []).includes(medal.id);
            return (
              <div 
                key={medal.id}
                className={`flex flex-col items-center gap-2 group transition-all ${isEarned ? 'opacity-100 scale-105' : 'opacity-10'}`}
              >
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isEarned ? 'shadow-lg' : ''}`}
                  style={{ 
                    borderColor: isEarned ? `${medal.color}60` : 'rgba(255,255,255,0.1)',
                    backgroundColor: isEarned ? `${medal.color}20` : 'transparent',
                    boxShadow: isEarned ? `0 0 20px ${medal.shadow}` : 'none'
                  }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={isEarned ? medal.color : 'currentColor'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span className="text-[8px] uppercase font-black text-center leading-tight tracking-tighter text-white/40 group-hover:text-white transition-colors">
                  {medal.label.replace(' Medal', '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
