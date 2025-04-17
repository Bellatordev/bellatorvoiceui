
import React from 'react';

const PulsatingCircle = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
      <div 
        className="w-40 h-40 rounded-full bg-violet-300/30 dark:bg-violet-500/20"
        style={{
          animation: 'pulsate 2s ease-in-out infinite',
          boxShadow: '0 0 20px 10px rgba(139, 92, 246, 0.2)'
        }}
      />
      <style>
        {`
          @keyframes pulsate {
            0% {
              transform: scale(0.95);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.3;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.6;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PulsatingCircle;
