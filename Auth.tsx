
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, CURRENT_SEASON } from '../types';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: '',
    so2Id: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = db.findUserByUsername(formData.username);
      if (user && user.password === formData.password) {
        if (user.isBanned) {
          setError('Ваш аккаунт заблокирован администрацией');
          return;
        }
        onLoginSuccess(user);
      } else {
        setError('Неверное имя пользователя или пароль');
      }
    } else {
      if (!formData.username || !formData.password || !formData.nickname || !formData.so2Id) {
        setError('Все поля обязательны для заполнения');
        return;
      }
      
      const existing = db.findUserByUsername(formData.username);
      if (existing) {
        setError('Это имя пользователя уже занято');
        return;
      }

      const newUser: Omit<User, 'id' | 'medals'> = {
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        so2Id: formData.so2Id,
        elo: 0, // Изменено с 1000 на 0
        matchesPlayed: 0,
        joinedAt: new Date().toISOString(),
        isBanned: false,
        seasonalStats: {
          [CURRENT_SEASON]: { elo: 0, matchesPlayed: 0 }
        }
      };

      const savedUser = db.saveUser(newUser);
      onLoginSuccess(savedUser);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-kanit font-bold uppercase tracking-tight text-white">
          {isLogin ? 'С возвращением' : 'Создать аккаунт'}
        </h2>
        <p className="text-white/40 text-sm">
          {isLogin ? 'Войдите, чтобы просмотреть свою статистику' : 'Присоединяйтесь к элите Standoff 2'}
        </p>
      </div>

      <div className="glass rounded-[32px] p-8 space-y-6 border-red-900/10 shadow-2xl shadow-red-600/5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-red-500/60 ml-1 font-bold">Никнейм в SO2</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ваш никнейм"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-red-500/60 ml-1 font-bold">ID в Standoff 2</label>
                <input 
                  type="text" 
                  required
                  placeholder="12345678"
                  value={formData.so2Id}
                  onChange={(e) => setFormData({...formData, so2Id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder:text-white/20"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-red-500/60 ml-1 font-bold">Имя пользователя (Faceit)</label>
            <input 
              type="text" 
              required
              placeholder="faceit_user"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-red-500/60 ml-1 font-bold">Пароль</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder:text-white/20"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center py-2 font-medium bg-red-600/5 rounded-lg border border-red-600/20">{error}</p>}

          <button 
            type="submit"
            className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 active:scale-[0.98] transition-all shadow-xl shadow-red-600/20"
          >
            {isLogin ? 'Войти в систему' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-white/30 text-xs hover:text-red-500 transition-colors uppercase font-bold tracking-tighter"
          >
            {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
          </button>
        </div>
      </div>
    </div>
  );
};
