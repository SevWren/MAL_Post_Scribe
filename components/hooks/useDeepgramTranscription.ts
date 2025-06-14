
/**
 * @file Custom React hook for managing Deepgram speech-to-text transcription.
 * Handles microphone permission, Deepgram connection, audio recording,
 * sending audio data, and receiving transcripts.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';

/**
 * Deepgram API Key.
 * @remarks For production, this should be managed via environment variables or a secure configuration service.
 * It's hardcoded here as per the specific requirements of the exercise.
 * @type {string}
 */
const DEEPGRAM_API_KEY = 'f7f55f1e94ea11f1cb5bbc0d2381e7b7b3525b91';

/**
 * @interface UseDeepgramTranscriptionProps
 * Props for the `useDeepgramTranscription` hook.
 * @property {boolean} isOpen - Flag indicating if the parent component (e.g., modal) is open. Used for cleanup.
 * @property {(transcript: string) => void} onTranscriptReceived - Callback function invoked when a finalized transcript is received.
 */
interface UseDeepgramTranscriptionProps {
  isOpen: boolean;
  onTranscriptReceived: (transcript: string) => void;
}

/**
 * @interface UseDeepgramTranscriptionReturn
 * Defines the return type of the `useDeepgramTranscription` hook.
 * @property {boolean} isRecording - True if audio is currently being recorded and sent to Deepgram.
 * @property {boolean} isTranscribing - True if Deepgram is still processing the final audio.
 * @property {string | null} transcriptionStatus - User-facing status message about the transcription process.
 * @property {string | null} deepgramError - Error message from Deepgram or the transcription process.
 * @property {() => Promise<void>} toggleRecording - Function to start or stop the recording and transcription process.
 * @property {'idle' | 'pending' | 'granted' | 'denied'} permissionStatus - Status of microphone permission.
 */
export interface UseDeepgramTranscriptionReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcriptionStatus: string | null;
  deepgramError: string | null;
  toggleRecording: () => Promise<void>;
  permissionStatus: 'idle' | 'pending' | 'granted' | 'denied';
}

/**
 * Custom hook for managing Deepgram live speech-to-text transcription.
 * It handles microphone access, connection to Deepgram, audio recording via `MediaRecorder`,
 * streaming audio data, and processing transcription events.
 *
 * @param {UseDeepgramTranscriptionProps} props - The props for the hook.
 * @returns {UseDeepgramTranscriptionReturn} An object containing state and functions for transcription.
 */
export const useDeepgramTranscription = ({ isOpen, onTranscriptReceived }: UseDeepgramTranscriptionProps): UseDeepgramTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); // For post-recording processing
  const [transcriptionStatus, setTranscriptionStatus] = useState<string | null>(null);
  const [deepgramError, setDeepgramError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const deepgramConnectionRef = useRef<LiveClient | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  /**
   * Cleans up resources: stops MediaRecorder, finishes Deepgram connection, and releases MediaStream.
   * Wrapped in `useCallback` for stable reference in `useEffect`.
   */
  const cleanupDeepgram = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // This will trigger 'onstop' event for MediaRecorder
    }
    mediaRecorderRef.current = null;

    if (deepgramConnectionRef.current) {
      // LiveConnectionState.OPEN is numerically 1 in the SDK
      if (deepgramConnectionRef.current.getReadyState() === 1 /* OPEN */) {
        // console.log("Deepgram: cleanupDeepgram - calling finish()");
        deepgramConnectionRef.current.finish(); // Signals end of audio stream to Deepgram
      }
      // The 'close' event handler for Deepgram will nullify deepgramConnectionRef.current
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecording(false);
    setIsTranscribing(false); 
    // Do not clear transcriptionStatus or deepgramError here, they might be needed by UI
    // Parent component (modal) is responsible for clearing them when it fully closes/resets.
  }, []);

  /**
   * Effect to handle cleanup when the modal (`isOpen`) closes or the component unmounts.
   */
  useEffect(() => {
    if (!isOpen) {
      cleanupDeepgram();
      // Reset status messages when modal is confirmed closed by parent
      setTranscriptionStatus(null);
      setDeepgramError(null);
      setPermissionStatus('idle');
    }
    // Ensures cleanup if the component unmounts while isOpen is still true.
    return () => {
      if (isOpen) { // Check if it was open when unmounting
        cleanupDeepgram();
      }
    };
  }, [isOpen, cleanupDeepgram]);

  /**
   * Requests microphone permission from the user.
   * Updates `permissionStatus` and `transcriptionStatus` accordingly.
   * @returns {Promise<MediaStream | null>} The MediaStream if permission is granted, otherwise null.
   * @async
   */
  const requestMicrophonePermission = async (): Promise<MediaStream | null> => {
    setPermissionStatus('pending');
    setTranscriptionStatus("Requesting microphone permission...");
    setDeepgramError(null); // Clear previous errors

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = "Microphone access is not supported by your browser.";
      setTranscriptionStatus(msg);
      setDeepgramError(msg);
      setPermissionStatus('denied');
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
      setTranscriptionStatus("Microphone permission granted.");
      return stream;
    } catch (err) {
      console.error("Microphone permission error:", err);
      const msg = "Microphone permission denied. Please enable microphone access in your browser settings.";
      setTranscriptionStatus(msg);
      setDeepgramError(msg);
      setPermissionStatus('denied');
      return null;
    }
  };

  /**
   * Toggles the recording state.
   * If not recording, requests permission, initializes Deepgram, and starts MediaRecorder.
   * If recording, stops MediaRecorder and signals Deepgram to finalize transcription.
   * @async
   */
  const toggleRecording = async () => {
    if (isRecording || isTranscribing) { // Stop recording or if already stopping
      setTranscriptionStatus("Stopping recording...");
      setIsTranscribing(true); // Indicate that processing of final audio will occur
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop(); // This triggers ondataavailable (last chunk) then onstop
      } else {
        // If stop is clicked again or recorder wasn't active, ensure full cleanup.
        cleanupDeepgram();
      }
      setIsRecording(false); // Immediate UI update; actual stop handles async cleanup
    } else { // Start recording
      setDeepgramError(null);
      
      const stream = await requestMicrophonePermission();
      if (!stream) return; // Permission not granted or not supported

      audioStreamRef.current = stream;
      setTranscriptionStatus("Initializing transcription service...");
      setIsTranscribing(true); // Indicate setup/initialization phase

      try {
        // This line is the fix for "url.startsWith is not a function" error.
        // It explicitly provides the Deepgram API endpoint.
        const deepgram = createClient(DEEPGRAM_API_KEY, {
          global: { url: 'https://api.deepgram.com' } 
        });
        const connection = deepgram.listen.live({
          model: 'nova-2',
          language: 'en-US',
          smart_format: true,
          interim_results: false, 
          utterance_end_ms: 1000, 
        });
        deepgramConnectionRef.current = connection;

        connection.on(LiveTranscriptionEvents.Open, () => {
          setTranscriptionStatus("Microphone connected. Recording...");
          setIsRecording(true);
          setIsTranscribing(false); 
          setDeepgramError(null);

          const mimeTypeOptions = [
            'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/opus',
          ];
          const selectedMimeType = mimeTypeOptions.find(type => MediaRecorder.isTypeSupported(type)) || '';
          if (!selectedMimeType) {
              const msg = "No suitable audio MimeType found for MediaRecorder.";
              console.error(msg);
              setDeepgramError(msg);
              setTranscriptionStatus(msg);
              cleanupDeepgram(); 
              return;
          }
          
          mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: selectedMimeType });

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0 && deepgramConnectionRef.current && 
                deepgramConnectionRef.current.getReadyState() === 1 /* OPEN */) {
              deepgramConnectionRef.current.send(event.data);
            }
          };
          
          mediaRecorderRef.current.onstop = () => {
            setIsRecording(false); 
            setIsTranscribing(true); 
            setTranscriptionStatus("Recording stopped. Processing final audio...");
            if (deepgramConnectionRef.current && deepgramConnectionRef.current.getReadyState() === 1 /* OPEN */) {
                deepgramConnectionRef.current.finish(); 
            } else {
                cleanupDeepgram();
            }
          };

          mediaRecorderRef.current.start(500); 
        });

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const transcript = data.channel.alternatives[0].transcript;
          if (transcript && data.is_final) { 
            onTranscriptReceived(transcript.trim());
            setTranscriptionStatus("Transcript received."); 
          }
        });

        connection.on(LiveTranscriptionEvents.Close, (event: { code: number; reason: string }) => {
          const closeReason = event.reason ? `, Reason: ${event.reason}` : '';
          setTranscriptionStatus(`Transcription connection closed (Code: ${event.code}${closeReason}). Ready to record again.`);
          cleanupDeepgram(); 
          setIsRecording(false);
          setIsTranscribing(false);
          deepgramConnectionRef.current = null; 
        });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
          console.error("Deepgram Error Event:", err);
          const errorMessage = typeof err === 'string' ? err : (err as Error).message || JSON.stringify(err);
          setTranscriptionStatus(`Transcription error: ${errorMessage.substring(0,100)}...`);
          setDeepgramError(`Deepgram Error: ${errorMessage}`);
          cleanupDeepgram(); 
        });
        
      } catch (err: any) {
        console.error("Deepgram setup/connection error:", err);
        const errorMessage = err.message || "Could not initialize transcription service.";
        setTranscriptionStatus(errorMessage);
        setDeepgramError(errorMessage);
        cleanupDeepgram(); 
      }
    }
  };

  return {
    isRecording,
    isTranscribing,
    transcriptionStatus,
    deepgramError,
    toggleRecording,
    permissionStatus,
  };
};
