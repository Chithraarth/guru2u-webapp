export type RecordingState = "idle" | "recording" | "paused" | "stopped";
export declare function useVoiceRecorder(): {
    state: RecordingState;
    startRecording: () => Promise<void>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => Promise<Blob>;
};
//# sourceMappingURL=useVoiceRecorder.d.ts.map