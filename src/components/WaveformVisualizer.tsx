
import React, { useEffect, useRef } from 'react';

type WaveformVisualizerProps = {
  isListening: boolean;
  className?: string;
};

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isListening, className }) => {
  return (
    <div className={`flex items-end justify-center h-16 space-x-1 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 bg-agent-primary rounded-full transform transition-all duration-300 ${
            isListening 
              ? `animate-wave-${i + 1}` 
              : 'h-2'
          }`}
          style={{
            opacity: isListening ? 1 : 0.3,
            height: isListening ? undefined : '8px',
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
