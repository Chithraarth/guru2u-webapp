import { useState, useEffect, useRef } from "react";
import { useCreateComboReading, getListReadingsQueryKey, getGetReadingStatsQueryKey } from "@workspace/api-client-react";
import { useVoiceRecorder } from "@workspace/integrations-openai-ai-react";
import { ReadingResult } from "@/components/reading-result";
import { OracleSpinner } from "@/components/oracle-spinner";
import { ImageUploader } from "@/components/image-uploader";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Handshake, Heart, Eye, Mic, Square, Pause, Play, Check, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stripBase64Prefix } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type ComboContext = "interview" | "business" | "relationship" | "general";

const CONTEXTS: { value: ComboContext; labelKey: string; descriptionKey: string; icon: typeof Briefcase }[] = [
  { value: "interview", labelKey: "combo.ctxInterview", descriptionKey: "combo.ctxInterviewDesc", icon: Briefcase },
  { value: "business", labelKey: "combo.ctxBusiness", descriptionKey: "combo.ctxBusinessDesc", icon: Handshake },
  { value: "relationship", labelKey: "combo.ctxRelationship", descriptionKey: "combo.ctxRelationshipDesc", icon: Heart },
  { value: "general", labelKey: "combo.ctxGeneral", descriptionKey: "combo.ctxGeneralDesc", icon: Eye },
];

export default function ComboReadingPage() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [readingResult, setReadingResult] = useState<any>(null);
  const [context, setContext] = useState<ComboContext>("interview");
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const createReading = useCreateComboReading();
  const { state, startRecording, pauseRecording, resumeRecording, stopRecording } = useVoiceRecorder();
  const isRecordingActive = state === "recording" || state === "paused";

  useEffect(() => {
    if (state === "recording") {
      timerRef.current = window.setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  const handleStartRecording = async () => {
    try {
      setAudioBase64(null);
      setRecordingTime(0);
      await startRecording();
    } catch {
      toast({ title: t("combo.micDeniedTitle"), description: t("combo.micDeniedDesc"), variant: "destructive" });
    }
  };

  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob.size === 0) return;
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => setAudioBase64(stripBase64Prefix(reader.result as string));
  };

  const hasAnySource = !!image || !!birthDate || !!audioBase64;

  const handleSubmit = () => {
    if (!hasAnySource) {
      toast({
        title: t("combo.missingTitle"),
        description: t("combo.missingDesc"),
        variant: "destructive",
      });
      return;
    }
    createReading.mutate(
      {
        data: {
          context,
          imageBase64: image?.base64,
          mimeType: image?.mimeType,
          birthDate: birthDate || undefined,
          birthPlace: birthPlace.trim() || undefined,
          audioBase64: audioBase64 || undefined,
          language: i18n.language,
        },
      },
      {
        onSuccess: (data) => {
          setReadingResult(data);
          queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
        },
        onError: (err: any) => {
          toast({
            title: t("combo.errorTitle"),
            description: err.message || t("combo.errorDesc"),
            variant: "destructive",
          });
        },
      },
    );
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

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
          <OracleSpinner message={t("combo.loading")} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-bold">{t("combo.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("combo.desc")}
            </p>
          </div>

          {/* Context selector */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="combo-context-selector">
            {CONTEXTS.map(({ value, labelKey, descriptionKey, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setContext(value)}
                data-testid={`button-context-${value}`}
                className={`text-start rounded-xl border-2 p-4 transition-all ${context === value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${context === value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium text-sm">{t(labelKey)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t(descriptionKey)}</p>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Face photo */}
            <Card className={`border-2 ${image ? "border-primary/40" : "border-dashed"}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t("combo.theirFace")}</h3>
                  {image && <Check className="w-4 h-4 text-primary" data-testid="icon-face-added" />}
                </div>
                <ImageUploader
                  onImageReady={(base64, mimeType) => setImage({ base64, mimeType })}
                  isPending={false}
                  label={t("combo.addFacePhoto")}
                  kind="face"
                />
              </CardContent>
            </Card>

            {/* Birth details */}
            <Card className={`border-2 ${birthDate ? "border-primary/40" : "border-dashed"}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t("combo.theirBirthDate")}</h3>
                  {birthDate && <Check className="w-4 h-4 text-primary" data-testid="icon-birth-added" />}
                </div>
                <div className="space-y-2">
                  <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} data-testid="input-combo-birth-date" />
                  <Label className="text-xs text-muted-foreground">{t("combo.birthPlaceOptional")}</Label>
                  <Input type="text" placeholder={t("astro.birthPlacePlaceholder")} value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} data-testid="input-combo-birth-place" />
                </div>
              </CardContent>
            </Card>

            {/* Conversation recording */}
            <Card className={`border-2 ${audioBase64 ? "border-primary/40" : "border-dashed"}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{t("combo.theConversation")}</h3>
                  {audioBase64 && <Check className="w-4 h-4 text-primary" data-testid="icon-audio-added" />}
                </div>
                <div className="flex flex-col items-center gap-3 py-2">
                  {isRecordingActive ? (
                    <>
                      <p className={`text-lg font-mono ${state === "paused" ? "text-amber-600" : "text-primary"}`} data-testid="text-combo-recording-time">
                        {formatTime(recordingTime)}{state === "paused" ? ` ${t("combo.pausedSuffix")}` : ""}
                      </p>
                      <div className="flex gap-2">
                        {state === "recording" ? (
                          <Button variant="outline" size="sm" onClick={pauseRecording} data-testid="button-combo-pause"><Pause className="w-4 h-4" /></Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={resumeRecording} data-testid="button-combo-resume"><Play className="w-4 h-4" /></Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={handleStopRecording} data-testid="button-combo-stop">
                          <Square className="w-4 h-4 me-1 fill-current" /> {t("combo.done")}
                        </Button>
                      </div>
                    </>
                  ) : audioBase64 ? (
                    <>
                      <p className="text-sm text-muted-foreground">{t("combo.captured", { time: formatTime(recordingTime) })}</p>
                      <Button variant="outline" size="sm" onClick={handleStartRecording} data-testid="button-combo-rerecord">
                        <Mic className="w-4 h-4 me-1" /> {t("combo.reRecord")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground text-center">{t("combo.recordHint")}</p>
                      <Button variant="outline" size="sm" onClick={handleStartRecording} data-testid="button-combo-record">
                        <Mic className="w-4 h-4 me-1" /> {t("combo.record")}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              variant="mystical"
              size="lg"
              className="rounded-full px-10"
              onClick={handleSubmit}
              disabled={isRecordingActive}
              data-testid="button-combo-submit"
            >
              <Sparkles className="me-2 w-5 h-5" /> {t("combo.reveal")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {hasAnySource
                ? t("combo.sourcesAdded", {
                    sources: [
                      image && t("combo.sourceFace"),
                      birthDate && t("combo.sourceBirthDate"),
                      audioBase64 && t("combo.sourceConversation"),
                    ].filter(Boolean).join(", "),
                  })
                : t("combo.addAtLeastOne")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
