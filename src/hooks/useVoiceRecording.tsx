import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseVoiceRecordingProps {
  onTranscription: (text: string) => void;
}

export const useVoiceRecording = ({
  onTranscription,
}: UseVoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        toast.success("Listening... Speak now!");
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        console.log(event.results);
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setIsProcessing(false);
        toast.error("Speech recognition error. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Failed to start voice recording");
    }
  }, [onTranscription]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      setIsProcessing(true);
      recognitionRef.current.stop();
      toast.info("Processing your voice...");
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    toggleRecording,
    startRecording,
    stopRecording,
  };
};

// Add type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
