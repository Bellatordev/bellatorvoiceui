
import React from 'react';

const PulsatingCircle = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
      <div 
        className="w-32 h-32 rounded-full bg-violet-500/20"
        style={{
          animation: 'pulsate 2s ease-in-out infinite'
        }}
      />
      <style>
        {`
          @keyframes pulsate {
            0% {
              transform: scale(0.95);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.2;
            }
            100% {
              transform: scale(0.95);
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PulsatingCircle;
