import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { ChatbotWidget } from '../chat/ChatbotWidget';
import { LuxuryBackground } from '../common/LuxuryBackground';
import { useTheme } from '../../context/ThemeContext';

export const UserLayout: React.FC = () => {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';

  return (
    <div
      className={`relative min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden ${
        isDark ? 'text-zinc-100' : 'text-zinc-900'
      }`}
    >
      {/* 1. Haute Couture Shimmering Luxury Background (Twinkling Stars & Fluid Ambient Glows) */}
      <LuxuryBackground />

      {/* 2. Left Slide-out Sidebar Drawer */}
      <Sidebar />

      {/* 3. Header Navbar */}
      <div className="relative z-40">
        <Header />
      </div>

      {/* 4. Main Page Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* 5. Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* 6. AI Chatbot Concierge Widget */}
      <div className="relative z-40">
        <ChatbotWidget />
      </div>
    </div>
  );
};
