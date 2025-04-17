
import React from 'react';

const PulsatingCircle = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
      {/* Outer glow ring */}
      <div 
        className="absolute w-72 h-72 rounded-full opacity-20 blur-xl"
        style={{
          background: 'linear-gradient(135deg, #0EA5E9, #33C3F0, #0FA0CE, #D3E4FD)',
          animation: 'spin 8s linear infinite',
        }}
      />
      
      {/* Main pulsating circle */}
      <div 
        className="relative w-64 h-64 rounded-full overflow-hidden backdrop-blur-sm border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(51, 195, 240, 0.2))',
          animation: 'pulsate 2s ease-in-out infinite',
          boxShadow: '0 0 30px 15px rgba(139, 92, 246, 0.15)',
        }}
      >
        {/* Inner rotating gradient */}
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #0EA5E9, #33C3F0, #0FA0CE)',
            opacity: 0.3,
            animation: 'spin 3s linear infinite',
          }}
        />
        
        {/* Futuristic rings */}
        <div className="absolute inset-4 rounded-full border border-white/20 animate-pulse" />
        <div className="absolute inset-8 rounded-full border border-white/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-12 rounded-full border border-white/10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <style>
        {`
          @keyframes pulsate {
            0% {
              transform: scale(0.98);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.02);
              opacity: 0.5;
            }
            100% {
              transform: scale(0.98);
              opacity: 0.8;
            }
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PulsatingCircle;
