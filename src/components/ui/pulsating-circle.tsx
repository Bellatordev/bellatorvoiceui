
import React from 'react';

const PulsatingCircle = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
      {/* Core circle */}
      <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-pulse" />
      
      {/* Outer rings */}
      <div className="relative">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              border border-blue-500/20 rounded-full
              animate-ping
            `}
            style={{
              width: `${i * 8 + 16}rem`,
              height: `${i * 8 + 16}rem`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
    </div>
  );
};

export default PulsatingCircle;
