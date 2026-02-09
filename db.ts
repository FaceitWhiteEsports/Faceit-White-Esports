
import { User, CURRENT_SEASON, ChatMessage, Ticket, TicketStatus, MEDALS_CONFIG } from '../types';

const USERS_KEY = 'faceit_white_users_v1';
const CHAT_KEY = 'faceit_white_chat_v1';
const TICKETS_KEY = 'faceit_white_tickets_v1';
const CHAT_EXPIRY_MS = 5 * 60 * 1000;

const checkAndApplyMedals = (user: User): User => {
  const currentMedals = user.medals || [];
  const newMedals = [...currentMedals];
  let changed = false;

  MEDALS_CONFIG.forEach(medal => {
    if (user.elo >= medal.threshold && !newMedals.includes(medal.id)) {
      newMedals.push(medal.id);
      changed = true;
    }
  });

  return changed ? { ...user, medals: newMedals } : user;
};

export const db = {
  // --- USERS ---
  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? (parsed as User[]) : [];
    } catch (e) {
      console.error("Ошибка чтения пользователей:", e);
      return [];
    }
  },

  getNextId: (): number => {
    const users = db.getUsers();
    if (users.length === 0) return 1;
    return Math.max(...users.map(u => u.id)) + 1;
  },

  saveUser: (userData: Omit<User, 'id' | 'medals'>) => {
    const users = db.getUsers();
    let newUser: User = {
      ...userData,
      id: db.getNextId(),
      medals: [],
      isBanned: userData.isBanned || false
    };
    
    newUser = checkAndApplyMedals(newUser);
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return newUser;
  },

  updateUser: (updatedUser: User) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      const userWithMedals = checkAndApplyMedals(updatedUser);
      users[index] = userWithMedals;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  deleteUser: (id: number) => {
    const users = db.getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    return filteredUsers;
  },

  findUserByUsername: (username: string): User | undefined => {
    return db.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  findUserById: (id: number): User | undefined => {
    return db.getUsers().find(u => u.id === id);
  },

  // --- CHAT ---
  getChatMessages: (): ChatMessage[] => {
    try {
      const data = localStorage.getItem(CHAT_KEY);
      if (!data) return [];
      const allMessages = JSON.parse(data) as ChatMessage[];
      const now = Date.now();
      const validMessages = allMessages.filter(msg => (now - msg.timestamp) < CHAT_EXPIRY_MS);
      if (validMessages.length !== allMessages.length) {
        localStorage.setItem(CHAT_KEY, JSON.stringify(validMessages));
      }
      return validMessages;
    } catch { return []; }
  },

  saveChatMessage: (msg: ChatMessage) => {
    const messages = db.getChatMessages();
    const updated = [...messages, msg].slice(-50);
    localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  // --- TICKETS ---
  getTickets: (): Ticket[] => {
    try {
      const data = localStorage.getItem(TICKETS_KEY);
      if (!data) return [];
      return JSON.parse(data) as Ticket[];
    } catch { return []; }
  },

  saveTicket: (ticket: Ticket) => {
    const tickets = db.getTickets();
    localStorage.setItem(TICKETS_KEY, JSON.stringify([...tickets, ticket]));
    window.dispatchEvent(new Event('storage'));
  },

  updateTicket: (updatedTicket: Ticket) => {
    const tickets = db.getTickets();
    const index = tickets.findIndex(t => t.id === updatedTicket.id);
    if (index !== -1) {
      tickets[index] = updatedTicket;
      localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
      window.dispatchEvent(new Event('storage'));
    }
  },

  deleteTicket: (id: string) => {
    const tickets = db.getTickets();
    const filtered = tickets.filter(t => t.id !== id);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage'));
  }
};

const ensureAdminsExist = () => {
  const users = db.getUsers();
  const adminsToEnsure = [
    { username: 'xeemplee', password: 'w8254413516S', so2Id: '1337', nickname: 'ADMIN' },
    { username: 'qut3guap', password: '70802802722Guapp', so2Id: 'qut3guap', nickname: 'GUAP' }
  ];

  let wasModified = false;
  const currentUsers = [...users];

  adminsToEnsure.forEach(adminData => {
    const exists = currentUsers.some(u => u.username.toLowerCase() === adminData.username.toLowerCase());
    if (!exists) {
      let newAdmin: User = {
        id: currentUsers.length > 0 ? Math.max(...currentUsers.map(u => u.id)) + 1 : (adminData.username === 'xeemplee' ? 1 : 2),
        username: adminData.username,
        password: adminData.password,
        so2Id: adminData.so2Id,
        nickname: adminData.nickname,
        avatarUrl: `https://picsum.photos/seed/${adminData.username}/400/400`,
        elo: 0, // Изменено с 1000 на 0
        matchesPlayed: 0,
        joinedAt: new Date().toISOString(),
        isBanned: false,
        medals: [],
        seasonalStats: { [CURRENT_SEASON]: { elo: 0, matchesPlayed: 0 } }
      };
      newAdmin = checkAndApplyMedals(newAdmin);
      currentUsers.push(newAdmin);
      wasModified = true;
    }
  });

  if (wasModified || localStorage.getItem(USERS_KEY) === null) {
    localStorage.setItem(USERS_KEY, JSON.stringify(currentUsers));
  }
};

ensureAdminsExist();
