import React, { createContext, useContext, useState, useEffect } from 'react';

const USERS_STORAGE_KEY = 'neoblood_users_v1';
const CURRENT_USER_KEY = 'neoblood_current_user_v1';

const DEFAULT_USERS = [];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing users', e);
      }
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing current user', e);
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = (email, password) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      if (password && found.password && found.password !== password) {
        return false;
      }
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const register = (userData) => {
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase().trim());
    if (existing) {
      return false;
    }

    const newUser = {
      ...userData,
      id: 'u-' + Math.random().toString(36).substring(2, 9),
      isAvailable: userData.isAvailable ?? true,
      totalDonations: 0,
      badges: ['New Lifesaver'],
      messages: []
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleAvailability = () => {
    if (!currentUser) return;
    const newStatus = !currentUser.isAvailable;
    const updated = { ...currentUser, isAvailable: newStatus };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const updateUser = (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const sendMessageToDonor = (donorEmail, messageText, isUrgent = false) => {
    if (!currentUser) return false;

    const newMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      fromName: currentUser.name,
      fromBloodGroup: currentUser.bloodGroup,
      fromEmail: currentUser.email,
      message: messageText,
      date: new Date().toISOString(),
      read: false,
      isUrgent
    };

    const isSendingToSelf = currentUser.email.toLowerCase() === donorEmail.toLowerCase();

    setUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === donorEmail.toLowerCase()) {
          const updatedMessages = [newMessage, ...(u.messages || [])];
          return { ...u, messages: updatedMessages };
        }
        return u;
      })
    );

    // Update currentUser separately to avoid stale closure inside setUsers callback
    if (isSendingToSelf) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        return { ...prev, messages: [newMessage, ...(prev.messages || [])] };
      });
    }

    return true;
  };

  const markMessagesRead = () => {
    if (!currentUser) return;
    const updatedMessages = (currentUser.messages || []).map((m) => ({ ...m, read: true }));
    const updatedUser = { ...currentUser, messages: updatedMessages };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLoggedIn: !!currentUser,
        login,
        register,
        logout,
        toggleAvailability,
        sendMessageToDonor,
        markMessagesRead,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
