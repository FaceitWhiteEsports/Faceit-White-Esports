
export interface SeasonalData {
  elo: number;
  matchesPlayed: number;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  so2Id: string;
  nickname: string;
  elo: number; 
  matchesPlayed: number; 
  joinedAt: string;
  avatarUrl?: string;
  isBanned?: boolean;
  medals: string[]; // Новое поле для хранения достигнутых медалей
  seasonalStats: Record<number, SeasonalData>;
}

export interface ChatMessage {
  id: string;
  userId: number;
  nickname: string;
  text: string;
  timestamp: number;
  isAdmin?: boolean;
}

export enum TicketStatus {
  PENDING = 'На рассмотрении',
  REVIEWED = 'Рассмотрен',
  CLOSED = 'Закрыт'
}

export interface TicketMessage {
  sender: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  reporterId: number;
  reporterNickname: string;
  reportedNickname: string;
  description: string;
  proof?: string;
  status: TicketStatus;
  createdAt: number;
  messages: TicketMessage[];
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

export enum RankTier {
  BRONZE = 'Бронза',
  SILVER = 'Серебро',
  GOLD = 'Золото',
  PLATINUM = 'Платина',
  DIAMOND = 'Алмаз',
  MASTER = 'Мастер',
  ELITE = 'Элита'
}

export const CURRENT_SEASON = 3;

export const getRankByElo = (elo: number): RankTier => {
  if (elo < 1000) return RankTier.BRONZE;
  if (elo < 1200) return RankTier.SILVER;
  if (elo < 1400) return RankTier.GOLD;
  if (elo < 1600) return RankTier.PLATINUM;
  if (elo < 1800) return RankTier.DIAMOND;
  if (elo < 2000) return RankTier.MASTER;
  return RankTier.ELITE;
};

export interface MedalConfig {
  id: string;
  label: string;
  threshold: number;
  color: string;
  shadow: string;
}

export const MEDALS_CONFIG: MedalConfig[] = [
  { id: 'white', label: 'White Medal', threshold: 100, color: '#FFFFFF', shadow: 'rgba(255,255,255,0.4)' },
  { id: 'green', label: 'Green Medal', threshold: 300, color: '#22C55E', shadow: 'rgba(34,197,94,0.4)' },
  { id: 'blue', label: 'Blue Medal', threshold: 500, color: '#3B82F6', shadow: 'rgba(59,130,246,0.4)' },
  { id: 'purple', label: 'Purple Medal', threshold: 700, color: '#A855F7', shadow: 'rgba(168,85,247,0.4)' },
  { id: 'dark-purple', label: 'Dark Purple Medal', threshold: 1000, color: '#7E22CE', shadow: 'rgba(126,34,206,0.4)' },
  { id: 'cyan', label: 'Cyan Medal', threshold: 1200, color: '#06B6D4', shadow: 'rgba(6,182,212,0.4)' },
  { id: 'dark-cyan', label: 'Dark Cyan Medal', threshold: 1400, color: '#0891B2', shadow: 'rgba(8,145,178,0.4)' },
  { id: 'brown', label: 'Brown Medal', threshold: 1600, color: '#92400E', shadow: 'rgba(146,64,14,0.4)' },
  { id: 'red', label: 'Red Medal', threshold: 1800, color: '#EF4444', shadow: 'rgba(239,68,68,0.4)' }
];
