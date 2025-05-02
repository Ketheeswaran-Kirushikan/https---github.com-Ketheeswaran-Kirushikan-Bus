'use client';

import React, { useState } from 'react';
import AuthPage from '@/components/auth/AuthPage';
import BookingPage from '@/components/booking/BookingPage';
import Header from '@/components/layout/Header';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const { user } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {user ? <BookingPage /> : <AuthPage />}
      </main>
      <footer className="bg-secondary text-secondary-foreground text-center p-4 text-sm">
        © {new Date().getFullYear()} Lanka Bus Ticket. All rights reserved.
      </footer>
    </div>
  );
}
