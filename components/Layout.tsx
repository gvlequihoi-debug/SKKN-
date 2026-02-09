import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen bg-[#2e1065] font-sans text-gray-800 flex flex-col bg-gradient-to-br from-[#1a0b2e] via-[#2e1065] to-[#4c1d95] overflow-hidden">
      {/* Ambient Light Effect */}
      <div className="ambient-glow no-print"></div>

      <header className="bg-primary/80 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 no-print border-b border-white/10 flex-shrink-0 h-16">
        {/* Yellow gradient border bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70"></div>
        <div className="container mx-auto px-4 h-full flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-2 group cursor-default">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary group-hover:text-yellow-300 transition-colors drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-yellow-100 transition-colors">
              Trợ Lý Viết SKKN <span className="text-secondary neon-text-gold">AI</span>
            </h1>
          </div>
          <div className="text-xs md:text-sm font-medium bg-white/10 px-3 py-1 rounded-full border border-yellow-500/30 text-white/90 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
            Developer by LOVE LE
          </div>
        </div>
      </header>
      
      {/* Main content area - flex-grow to take remaining height */}
      <main className="flex-grow flex relative z-10 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;