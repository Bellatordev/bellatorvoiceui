
import { useCallback } from 'react';

interface TranscriptionHandlerProps {
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
}

export const useTranscriptionHandler = ({
  onTranscript,
  onFinalTranscript
}: TranscriptionHandlerProps) => {
  const handleTranscriptionResult = useCallback((event: SpeechRecognitionEvent) => {
    let currentTranscript = '';
    let isFinal = false;
    
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      currentTranscript += event.results[i][0].transcript;
      isFinal = event.results[i].isFinal;
    }
    
    console.log('Speech recognition result:', currentTranscript, isFinal);
    
    // Always call onTranscript with the current transcript for real-time display
    onTranscript?.(currentTranscript);
    
    if (isFinal) {
      console.log('Final transcript:', currentTranscript);
      onFinalTranscript?.(currentTranscript);
    }
  }, [onTranscript, onFinalTranscript]);

  return { handleTranscriptionResult };
};
