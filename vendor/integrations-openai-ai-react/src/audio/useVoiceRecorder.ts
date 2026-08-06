/**
 * React hook for voice recording using MediaRecorder API.
 * Negotiates a supported MIME type across browsers (Chrome, Firefox, Safari).
 */
import { useRef, useCallback, useState } from "react";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
];

function getSupportedMimeType(): string | undefined {
  for (const mimeType of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return undefined;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string | undefined>(undefined);

  const startRecording = useCallback(async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedMimeType();
    mimeTypeRef.current = mimeType;

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start(100);
    setState("recording");
  }, []);

  const pauseRecording = useCallback((): void => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      setState("paused");
    }
  }, []);

  const resumeRecording = useCallback((): void => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      setState("recording");
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob());
        return;
      }

      recorder.onstop = () => {
        const blobType = mimeTypeRef.current ?? recorder.mimeType ?? "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        recorder.stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        setState("stopped");
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  return { state, startRecording, pauseRecording, resumeRecording, stopRecording };
}
