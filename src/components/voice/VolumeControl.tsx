
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  isMuted: boolean;
  volume: number;
  onVolumeChange: (value: number[]) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  isMuted,
  volume,
  onVolumeChange
}) => {
  return (
    <div className="mt-8 flex items-center space-x-2 w-48 bg-white/5 backdrop-blur-sm p-2 rounded-full border border-white/10 dark:border-gray-800/30">
      <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      <Slider
        value={[isMuted ? 0 : volume]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={onVolumeChange}
        className="w-full"
        aria-label="Volume"
      />
      {isMuted && (
        <VolumeX className="w-4 h-4 text-red-500" />
      )}
    </div>
  );
};

export default VolumeControl;
