import { useState } from "react";
import { useCreateAstroReading, getListReadingsQueryKey, getGetReadingStatsQueryKey } from "@workspace/api-client-react";
import { ReadingResult } from "@/components/reading-result";
import { OracleSpinner } from "@/components/oracle-spinner";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Moon, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function AstroReadingPage() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [readingResult, setReadingResult] = useState<any>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState(""); // "1".."12"
  const [birthMinute, setBirthMinute] = useState(""); // "00".."59"
  const [birthPeriod, setBirthPeriod] = useState<"AM" | "PM">("AM");
  const [birthPlace, setBirthPlace] = useState("");

  const composedTime = (() => {
    if (!birthHour) return undefined;
    let h = Number(birthHour) % 12;
    if (birthPeriod === "PM") h += 12;
    const m = birthMinute || "00";
    return `${String(h).padStart(2, "0")}:${m}`;
  })();

  const createReading = useCreateAstroReading();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !birthPlace.trim()) {
      toast({
        title: t("astro.missingTitle"),
        description: t("astro.missingDesc"),
        variant: "destructive",
      });
      return;
    }
    createReading.mutate(
      {
        data: {
          birthDate,
          birthTime: composedTime,
          birthPlace: birthPlace.trim(),
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
            title: t("astro.errorTitle"),
            description: err.message || t("astro.errorDesc"),
            variant: "destructive",
          });
        },
      },
    );
  };

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
          <OracleSpinner message={t("astro.loading")} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-bold">{t("astro.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {t("astro.desc")}
            </p>
          </div>

          <Card className="max-w-md mx-auto border-2 border-dashed bg-transparent">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Moon className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth-date">{t("astro.birthDate")}</Label>
                  <Input
                    id="birth-date"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    data-testid="input-birth-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth-time">
                    {t("astro.birthTime")} <span className="text-muted-foreground font-normal">{t("astro.birthTimeOptional")}</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      id="birth-time"
                      value={birthHour}
                      onChange={(e) => setBirthHour(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-testid="select-birth-hour"
                    >
                      <option value="">{t("astro.hour")}</option>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <select
                      value={birthMinute}
                      onChange={(e) => setBirthMinute(e.target.value)}
                      disabled={!birthHour}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      data-testid="select-birth-minute"
                    >
                      <option value="">{t("astro.minute")}</option>
                      {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={birthPeriod}
                      onChange={(e) => setBirthPeriod(e.target.value as "AM" | "PM")}
                      disabled={!birthHour}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      data-testid="select-birth-period"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  {composedTime && (
                    <p className="text-xs text-muted-foreground">{t("astro.birthTimePreview", { time: `${birthHour}:${birthMinute || "00"} ${birthPeriod}` })}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth-place">{t("astro.birthPlace")}</Label>
                  <Input
                    id="birth-place"
                    type="text"
                    placeholder={t("astro.birthPlacePlaceholder")}
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    required
                    data-testid="input-birth-place"
                  />
                </div>

                <Button type="submit" variant="mystical" size="lg" className="w-full rounded-full" data-testid="button-cast-chart">
                  <Sparkles className="me-2 w-5 h-5" /> {t("astro.castChart")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
