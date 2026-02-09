
import React, { useState } from 'react';
import { AuthState } from '../types';
import { RulesModal } from './RulesModal';

interface LayoutProps {
  children: React.ReactNode;
  authState: AuthState;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'profile' | 'admin' | 'auth' | 'chat' | 'tickets') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, authState, onLogout, onNavigate }) => {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const isAdmin = authState.user?.username === 'xeemplee' || authState.user?.username === 'qut3guap';

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-red-900/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center font-bold rounded group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              W
            </div>
            <span className="font-kanit font-bold text-xl tracking-tight uppercase">
              Faceit <span className="text-red-500">White</span>
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => onNavigate('tickets')}
              className="text-[10px] md:text-sm font-medium hover:text-red-400 text-white/60 transition-colors uppercase tracking-widest"
            >
              Отправить репорт
            </button>
            <button 
              onClick={() => setIsRulesOpen(true)}
              className="px-4 py-1.5 bg-red-600/20 border border-red-600/30 text-red-500 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
            >
              Правила
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="text-[10px] md:text-sm font-medium hover:text-red-400 text-white/60 transition-colors uppercase tracking-widest"
            >
              Лидеры
            </button>
            <button 
              onClick={() => onNavigate('chat')}
              className="text-[10px] md:text-sm font-medium hover:text-red-400 text-white/60 transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              Чат
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
            </button>
            
            {authState.isAuthenticated ? (
              <>
                {isAdmin && (
                  <button 
                    onClick={() => onNavigate('admin')}
                    className="text-[10px] md:text-sm font-medium text-red-500 hover:text-red-400 transition-colors font-bold uppercase tracking-wider"
                  >
                    Админ
                  </button>
                )}
                <button 
                  onClick={() => onNavigate('profile')}
                  className="hidden md:block text-sm font-medium hover:text-white text-white/60 transition-colors"
                >
                  Профиль
                </button>
                <button 
                  onClick={onLogout}
                  className="px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] md:text-sm font-medium hover:bg-red-600/20 transition-all text-red-500"
                >
                  Выйти
                </button>
              </>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-[10px] md:text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-red-600/20"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-[10px] md:text-xs">
          <p>© 2026 Faceit White Esports. Все права защищены.</p>
          <div className="flex gap-4">
            <button onClick={() => setIsRulesOpen(true)} className="hover:text-red-500 transition-colors uppercase font-bold">Правила</button>
            <a 
              href="https://t.me/Faceitwea" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-red-500 transition-colors uppercase font-bold tracking-widest"
            >
              Telegram
            </a>
            <a 
              href="https://store.standoff2.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-red-500 transition-colors uppercase font-bold"
            >
              Standoff 2
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
