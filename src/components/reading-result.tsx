import { Reading } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sparkles, Quote, Brain, Star, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "./ui/scroll-area";

interface ReadingResultProps {
  reading: Reading;
}

export function ReadingResult({ reading }: ReadingResultProps) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <div className="text-center space-y-4">
        <Badge variant="mystical" className="px-3 py-1 mb-2">
          {reading.kind === "face" ? t("result.kindFace") : reading.kind === "palm" ? t("result.kindPalm") : reading.kind === "astro" ? t("result.kindAstro") : reading.kind === "combo" ? t("result.kindCombo") : t("result.kindVoice")}
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-display font-bold mystical-text-gradient">
          {reading.archetype}
        </h1>
        <p className="text-xl text-muted-foreground italic font-medium max-w-xl mx-auto">
          "{reading.title}"
        </p>
      </div>

      {/* Interaction playbook — what to do next */}
      {reading.interactionTips && reading.interactionTips.length > 0 && (
        <Card className="border-primary/30 bg-primary text-primary-foreground shadow-lg" data-testid="card-interaction-tips">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <ArrowRight className="w-6 h-6" />
              {t("result.nextMoves")}
            </CardTitle>
            <CardDescription className="text-primary-foreground/70">
              {t("result.nextMovesDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {reading.interactionTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Portrait if face reading */}
      {reading.portraitImage && (
        <div className="flex justify-center my-8">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
            <img 
              src={reading.portraitImage} 
              alt={reading.archetype} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-full" />
          </div>
        </div>
      )}

      {/* Daily astrology highlights */}
      {(reading.zodiacSign || reading.luckyColor || reading.luckyNumber) && (
        <div className="grid grid-cols-3 gap-4" data-testid="astro-daily-highlights">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("result.sign")}</p>
              <p className="text-lg font-display font-semibold text-primary" data-testid="text-zodiac-sign">{reading.zodiacSign}</p>
            </CardContent>
          </Card>
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4 text-center space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("result.todaysColor")}</p>
              <p className="text-lg font-display font-semibold text-accent-foreground" data-testid="text-lucky-color">{reading.luckyColor}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-center space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("result.luckyNumber")}</p>
              <p className="text-lg font-display font-semibold text-primary" data-testid="text-lucky-number">{reading.luckyNumber}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {reading.dailyHoroscope && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              {t("result.todaysHoroscope")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-base leading-relaxed" data-testid="text-daily-horoscope">
            <p>{reading.dailyHoroscope}</p>
          </CardContent>
        </Card>
      )}

      {/* Core Summary */}
      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardContent className="p-6 sm:p-8 text-lg leading-relaxed text-foreground/90">
          <Quote className="w-8 h-8 text-primary/40 mb-4 inline-block" />
          <p>{reading.summary}</p>
        </CardContent>
      </Card>

      {/* Traits & Strengths */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              {t("result.coreTraits")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {reading.traits.map((trait, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{trait}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              {t("result.strengths")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {reading.strengths.map((strength, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1">
                  {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details if available */}
      {reading.details && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("result.deeperAnalysis")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 sm:h-auto rounded-md pr-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {reading.details}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Guidance */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            {t("result.guidance")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-lg">
          <p>{reading.guidance}</p>
        </CardContent>
      </Card>

      {/* Transcript if voice */}
      {reading.transcript && (
        <div className="pt-8 border-t border-border/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{t("result.transcript")}</h4>
          <p className="text-sm text-muted-foreground/80 italic border-l-2 border-border pl-4">
            {reading.transcript}
          </p>
        </div>
      )}
    </div>
  );
}
