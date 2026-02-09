
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { Admin } from './components/Admin';
import { Chat } from './components/Chat';
import { Tickets } from './components/Tickets';
import { AuthState, User } from './types';
import { db } from './services/db';

type View = 'home' | 'auth' | 'profile' | 'admin' | 'chat' | 'tickets';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('current_user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        const freshUser = db.findUserById(savedUser.id);
        if (freshUser && !freshUser.isBanned) {
          setAuthState({ user: freshUser, isAuthenticated: true });
        } else {
          localStorage.removeItem('current_user');
          setAuthState({ user: null, isAuthenticated: false });
        }
      } catch (e) {
        localStorage.removeItem('current_user');
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
    localStorage.setItem('current_user', JSON.stringify(user));
    setView('home');
  };

  const handleLogout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('current_user');
    setView('home');
  };

  const navigateToProfile = (userId: number) => {
    setSelectedUserId(userId);
    setView('profile');
    window.scrollTo(0, 0);
  };

  const isAdmin = (username?: string) => {
    if (!username) return false;
    const admins = ['xeemplee', 'qut3guap'];
    return admins.includes(username.toLowerCase());
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <Home onNavigateProfile={navigateToProfile} />;
      case 'auth':
        return <Auth onLoginSuccess={handleLogin} />;
      case 'chat':
        return <Chat currentUser={authState.user} />;
      case 'tickets':
        return <Tickets currentUser={authState.user} />;
      case 'profile':
        const userIdToFetch = selectedUserId || authState.user?.id;
        const userToView = userIdToFetch ? db.findUserById(userIdToFetch) : null;
        
        return userToView ? (
          <Profile 
            user={userToView} 
            isOwnProfile={authState.user?.id === userToView.id} 
            onUpdateUser={(updated) => {
              if (authState.user?.id === updated.id) {
                setAuthState({ ...authState, user: updated });
                localStorage.setItem('current_user', JSON.stringify(updated));
              }
            }}
          />
        ) : <Home onNavigateProfile={navigateToProfile} />;
      case 'admin':
        if (isAdmin(authState.user?.username)) {
          return <Admin />;
        }
        return <Home onNavigateProfile={navigateToProfile} />;
      default:
        return <Home onNavigateProfile={navigateToProfile} />;
    }
  };

  return (
    <Layout 
      authState={authState} 
      onLogout={handleLogout} 
      onNavigate={(v) => {
        if (v === 'profile') setSelectedUserId(null);
        setView(v as View);
        window.scrollTo(0, 0);
      }}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
