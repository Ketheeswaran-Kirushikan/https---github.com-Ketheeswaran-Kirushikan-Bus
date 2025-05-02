import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Using only Geist Sans for simplicity
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import AppProvider from '@/context/AppContext'; // Import AppProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Lanka Bus Ticket',
  description: 'Book your bus tickets in Sri Lanka easily.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AppProvider> {/* Wrap with AppProvider */}
          {children}
          <Toaster /> {/* Add Toaster here */}
        </AppProvider>
      </body>
    </html>
  );
}
