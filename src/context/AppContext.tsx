'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UserProfile } from '@/types/booking';

interface AppContextProps {
  user: UserProfile | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (userData: Omit<UserProfile, 'id'>) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Mock user storage (replace with actual storage like localStorage or backend)
let mockUsers: UserProfile[] = [];
let mockPasswordStore: Record<string, string> = {}; // email -> password hash (in real app, never store plain passwords)

export default function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load user from localStorage on initial mount (optional persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('lankaBusUser');
    const storedUsers = localStorage.getItem('lankaBusUsers');
    const storedPasswords = localStorage.getItem('lankaBusPasswords');

    if (storedUsers) {
        mockUsers = JSON.parse(storedUsers);
    }
     if (storedPasswords) {
        mockPasswordStore = JSON.parse(storedPasswords);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

   const saveState = (currentUser: UserProfile | null) => {
    localStorage.setItem('lankaBusUser', JSON.stringify(currentUser));
    localStorage.setItem('lankaBusUsers', JSON.stringify(mockUsers));
    localStorage.setItem('lankaBusPasswords', JSON.stringify(mockPasswordStore));
   }

  const login = (email: string, password: string) => {
    const foundUser = mockUsers.find(u => u.email === email);
    // IMPORTANT: NEVER compare plain text passwords in a real app.
    // This is a highly insecure mock. Use password hashing (e.g., bcrypt).
    const storedPassword = mockPasswordStore[email];

    if (foundUser && storedPassword === password) { // Insecure comparison
      setUser(foundUser);
      saveState(foundUser);
    } else {
      throw new Error('Invalid email or password.');
    }
  };

  const logout = () => {
    setUser(null);
    saveState(null);
  };

  const register = (userData: Omit<UserProfile, 'id'>) => {
    // Check if email or NIC already exists
    if (mockUsers.some(u => u.email === userData.email)) {
      throw new Error('Email already registered.');
    }
    if (mockUsers.some(u => u.nic === userData.nic)) {
      throw new Error('NIC already registered.');
    }

    // In a real app, hash the password here before storing
    const hashedPassword = userData.password; // Highly insecure mock

    const newUser: UserProfile = {
      id: `user-${Date.now()}`, // Simple unique ID
      ...userData,
    };

    mockUsers.push(newUser);
    mockPasswordStore[newUser.email] = hashedPassword; // Store insecure "hashed" password

    saveState(user); // Save updated user list and passwords
    console.log('Registered users:', mockUsers);
    console.log('Password store:', mockPasswordStore); // For debugging only
  };

  return (
    <AppContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
