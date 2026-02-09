
import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="glass relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 md:p-12 rounded-[40px] border-red-600/20 shadow-[0_0_80px_rgba(220,38,38,0.1)] animate-in zoom-in-95 duration-300 flex flex-col gap-8 custom-scrollbar">
        
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-4xl font-kanit font-extrabold uppercase tracking-tight leading-none">
              Правила <span className="text-red-600">Сервера</span>
            </h2>
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em]">Faceit White Esports • 2026</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 transition-colors text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-6 text-sm text-white/80 leading-relaxed font-medium">
          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">01</div>
            <p>Запрещено оскорблять других игроков.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">02</div>
            <p>Запрещено провоцировать конфликты и разжигать споры.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">03</div>
            <p>Запрещён спам в чате.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">04</div>
            <p>Если на аккаунте игрока будут замечены подозрительные действия, аккаунт будет заблокирован, а уведомление отправлено настоящему владельцу.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">05</div>
            <p>Если возникают проблемы с созданием аккаунта, обратитесь в поддержку нашего бота в Telegram.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">06</div>
            <p>Если ваш аккаунт был забанен по какой-либо причине, разбан невозможен. Также не рекомендуется создавать твинки, так как ID игрока сохраняется в нашей базе данных.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">07</div>
            <p>Если вы отправляете репорт на игрока, обязательно опишите нарушение и по возможности приложите видео-доказательство.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">08</div>
            <p>Если вы достигли <span className="text-red-500 font-bold">4 000+ Elo</span>, вы можете написать в техническую поддержку и получить приз.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">09</div>
            <p>Если на ваш аккаунт поступило более 10 репортов, он будет забанен навсегда без возможности покупки разбана.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">10</div>
            <p>Если вы не заходите на аккаунт более полугода, с него будет списываться –300 Elo каждые 6 месяцев.</p>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded bg-red-600/20 flex-shrink-0 flex items-center justify-center text-red-500 font-bold text-[10px]">11</div>
            <p>Если вы используете запрещённый ник или аватар, аккаунт будет немедленно забанен и удалён.</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-red-600 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};
