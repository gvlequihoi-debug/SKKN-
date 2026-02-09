import React, { useEffect, useState } from 'react';

interface ProcessingOverlayProps {
  currentSection: string;
  progress: number; // 0 to 100
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ currentSection, progress }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.6)] p-8 text-center border-2 border-yellow-400/50 relative overflow-hidden neon-border">
        {/* Decorative background glow inside modal */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <svg className="animate-spin w-full h-full text-secondary drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary">
            {Math.round(progress)}%
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đang viết sáng kiến{dots}</h3>
        <p className="text-gray-500 mb-6">Trí tuệ nhân tạo đang soạn thảo chi tiết từng mục.</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
          <div 
            className="bg-secondary h-2.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(251,191,36,1)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm font-medium text-primary truncate">
          Đang viết: <span className="font-bold text-yellow-600">{currentSection}</span>
        </p>
      </div>
    </div>
  );
};

export default ProcessingOverlay;