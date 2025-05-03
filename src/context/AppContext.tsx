'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: { id: string; email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (values: {
    userName: string;
    nic: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after the component mounts on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize user state from localStorage on the client side
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Initialized user from localStorage:', parsedUser);
          if (parsedUser.id) {
            setUser(parsedUser);
          } else {
            console.error('Stored user missing id:', parsedUser);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, [isClient]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://172.20.10.2:9002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Login failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.user.id) {
        throw new Error('Login response missing user id');
      }

      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Set user after login:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      throw new Error(error.message || 'Failed to login. Please check your network and try again.');
    }
  };

  const register = async (values: {
    userName: string;
    nic: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => {
    try {
      const response = await fetch('http://172.20.10.2:9002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          name: values.userName,
          nic: values.nic,
          phoneNumber: values.phoneNumber,
        }),
      });

      console.log('Register response status:', response.status);
      console.log('Register response headers:', [...response.headers.entries()]);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Register error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      throw new Error(error.message || 'Failed to register. Please check your network and try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}