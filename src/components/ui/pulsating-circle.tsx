
import React from 'react';

const PulsatingCircle = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
      <div 
        className="w-64 h-64 rounded-full bg-violet-400/40 dark:bg-violet-500/30"
        style={{
          animation: 'pulsate 2s ease-in-out infinite',
          boxShadow: '0 0 30px 15px rgba(139, 92, 246, 0.3)'
        }}
      />
      <style>
        {`
          @keyframes pulsate {
            0% {
              transform: scale(0.95);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.4;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.7;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PulsatingCircle;
