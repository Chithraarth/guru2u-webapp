import { useState, useEffect, useRef } from "react";
import { useCreateVoiceReading, getListReadingsQueryKey, getGetReadingStatsQueryKey } from "@workspace/api-client-react";
import { useVoiceRecorder } from "@workspace/integrations-openai-ai-react";
import { ReadingResult } from "@/components/reading-result";
import { OracleSpinner } from "@/components/oracle-spinner";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mic, Square, Pause, Play, MessageSquareText, Users, Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { stripBase64Prefix } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type VoiceMode = "note" | "conversation" | "date";

export default function VoiceReadingPage() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [readingResult, setReadingResult] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mode, setMode] = useState<VoiceMode>("note");
  const timerRef = useRef<number | null>(null);

  const createReading = useCreateVoiceReading();
  const { state, startRecording, pauseRecording, resumeRecording, stopRecording } = useVoiceRecorder();

  const MAX_RECORDING_SECONDS = 30 * 60;

  // Timer logic
  useEffect(() => {
    if (state === "recording") {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (state === "idle" || state === "stopped") setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  // Auto-stop at the max supported length
  useEffect(() => {
    if (state === "recording" && recordingTime >= MAX_RECORDING_SECONDS) {
      toast({
        title: t("voice.maxLengthTitle"),
        description: t("voice.maxLengthDesc"),
      });
      handleStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingTime, state]);

  const handleStart = async () => {
    try {
      await startRecording();
    } catch (err: any) {
      toast({
        title: t("voice.micDeniedTitle"),
        description: t("voice.micDeniedDesc"),
        variant: "destructive",
      });
    }
  };

  const handleStop = async () => {
    const blob = await stopRecording();
    if (blob.size === 0) return;

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = stripBase64Prefix(dataUrl);

      createReading.mutate(
        { data: { audioBase64: base64, mode, language: i18n.language } },
        {
          onSuccess: (data) => {
            setReadingResult(data);
            queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
          },
          onError: (err: any) => {
            toast({
              title: t("voice.errorTitle"),
              description: err.message || t("voice.errorDesc"),
              variant: "destructive",
            });
          }
        }
      );
    };
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isActive = state === "recording" || state === "paused";

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("common.backToOracle")}
        </Link>
      </div>

      {readingResult ? (
        <ReadingResult reading={readingResult} />
      ) : createReading.isPending ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <OracleSpinner message={mode === "date" ? t("voice.loadingDate") : mode === "conversation" ? t("voice.loadingConversation") : t("voice.loadingNote")} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-bold">{t("voice.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {mode === "date"
                ? t("voice.descDate")
                : mode === "conversation"
                ? t("voice.descConversation")
                : t("voice.descNote")}
            </p>
          </div>

          {!isActive && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto" data-testid="voice-mode-selector">
              <button
                type="button"
                onClick={() => setMode("note")}
                data-testid="button-mode-note"
                className={`text-start rounded-xl border-2 p-4 transition-all ${mode === "note" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <MessageSquareText className={`w-5 h-5 ${mode === "note" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium">{t("voice.modeNote")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t("voice.modeNoteDesc")}</p>
              </button>
              <button
                type="button"
                onClick={() => setMode("conversation")}
                data-testid="button-mode-conversation"
                className={`text-start rounded-xl border-2 p-4 transition-all ${mode === "conversation" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <Users className={`w-5 h-5 ${mode === "conversation" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium">{t("voice.modeConversation")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t("voice.modeConversationDesc")}</p>
              </button>
              <button
                type="button"
                onClick={() => setMode("date")}
                data-testid="button-mode-date"
                className={`text-start rounded-xl border-2 p-4 transition-all ${mode === "date" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <Heart className={`w-5 h-5 ${mode === "date" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium">{t("voice.modeDate")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t("voice.modeDateDesc")}</p>
              </button>
            </div>
          )}

          <Card className="max-w-md mx-auto border-2 border-dashed bg-transparent">
            <CardContent className="p-8 flex flex-col items-center justify-center space-y-8">

              <div className="relative">
                {state === "recording" && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" style={{ animationDuration: '2s' }} />
                  </>
                )}
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300 ${state === 'recording' ? 'bg-primary/20 text-primary' : state === 'paused' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                  {state === "paused" ? <Pause className="w-10 h-10" /> : <Mic className={`w-10 h-10 ${state === "recording" ? "animate-pulse" : ""}`} />}
                </div>
              </div>

              <div className="text-center space-y-2 h-16">
                {state === "recording" ? (
                  <>
                    <p className="text-2xl font-mono font-medium text-primary" data-testid="text-recording-time">{formatTime(recordingTime)}</p>
                    <p className="text-sm text-primary/80">{t("voice.listening")}</p>
                  </>
                ) : state === "paused" ? (
                  <>
                    <p className="text-2xl font-mono font-medium text-amber-600" data-testid="text-recording-time">{formatTime(recordingTime)}</p>
                    <p className="text-sm text-muted-foreground">{t("voice.paused")}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-medium">{t("voice.ready")}</p>
                    <p className="text-sm text-muted-foreground">
                      {mode === "date" ? t("voice.readyHintDate") : mode === "conversation" ? t("voice.readyHintConversation") : t("voice.readyHintNote")}
                    </p>
                  </>
                )}
              </div>

              <div className="flex justify-center gap-3">
                {!isActive ? (
                  <Button variant="mystical" size="lg" onClick={handleStart} className="rounded-full px-8" data-testid="button-start-recording">
                    <Mic className="me-2 w-5 h-5" /> {t("voice.startRecording")}
                  </Button>
                ) : (
                  <>
                    {state === "recording" ? (
                      <Button variant="outline" size="lg" onClick={pauseRecording} className="rounded-full px-6" data-testid="button-pause-recording">
                        <Pause className="me-2 w-5 h-5" /> {t("voice.pause")}
                      </Button>
                    ) : (
                      <Button variant="outline" size="lg" onClick={resumeRecording} className="rounded-full px-6" data-testid="button-resume-recording">
                        <Play className="me-2 w-5 h-5" /> {t("voice.resume")}
                      </Button>
                    )}
                    <Button variant="destructive" size="lg" onClick={handleStop} className="rounded-full px-6 shadow-[0_0_20px_rgba(255,0,0,0.3)]" data-testid="button-stop-recording">
                      <Square className="me-2 w-5 h-5 fill-current" /> {t("voice.stopReveal")}
                    </Button>
                  </>
                )}
              </div>

              {mode !== "note" && isActive && (
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  {mode === "date"
                    ? t("voice.recordingHintDate")
                    : t("voice.recordingHintConversation")}
                </p>
              )}
              {mode === "date" && !isActive && (
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  {t("voice.consentHint")}
                </p>
              )}

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
