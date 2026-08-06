import { useGetReadingStats, useListReadings } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Camera, Mic, Hand, Moon, Eye, ArrowRight, Sparkles, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetReadingStats();
  const { data: readings, isLoading: readingsLoading } = useListReadings();
  const { t } = useTranslation();

  const recentReadings = readings?.slice(0, 3) || [];

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 sm:py-20 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-5xl sm:text-7xl font-display font-bold tracking-tight text-foreground">
          {t("home.heroTitlePre")} <span className="mystical-text-gradient">{t("home.heroTitleHighlight")}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t("home.heroSubtitle")}
        </p>
      </section>

      {/* Insight Reading — top highlight */}
      <section>
        <Link href="/insight" className="group no-underline block">
          <Card className="border-accent/30 hover:border-accent/60 transition-all duration-500 hover:shadow-xl hover:shadow-accent/5 bg-gradient-to-r from-card via-accent/5 to-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardContent className="p-6 flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-500">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold mb-1">{t("home.insightTitle")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t("home.insightDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Modes Grid — 2 x 2 tiles with descriptions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {[
          { href: "/face", label: t("home.modeFace"), desc: t("home.modeFaceDesc"), icon: <Camera className="w-8 h-8" /> },
          { href: "/voice", label: t("home.modeVoice"), desc: t("home.modeVoiceDesc"), icon: <Mic className="w-8 h-8" /> },
          { href: "/palm", label: t("home.modePalm"), desc: t("home.modePalmDesc"), icon: <Hand className="w-8 h-8" /> },
          { href: "/astro", label: t("home.modeAstro"), desc: t("home.modeAstroDesc"), icon: <Moon className="w-8 h-8" /> },
        ].map((m) => (
          <Link key={m.href} href={m.href} className="group no-underline">
            <Card className="h-full border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-b from-card to-primary/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  {m.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-display font-semibold">{m.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Stats & Recent */}
      <section className="grid md:grid-cols-3 gap-8 pt-8 border-t border-border/50">
        <div className="md:col-span-1 space-y-6">
          <h3 className="text-xl font-display font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("home.guruGuidance")}
          </h3>
          <Card className="bg-muted/30 border-none shadow-none">
            <CardContent className="p-6 space-y-4">
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("home.totalReadings")}</p>
                    <p className="text-3xl font-display font-bold text-foreground">{stats?.total || 0}</p>
                  </div>
                  {stats?.latestArchetype && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground mb-1">{t("home.latestArchetype")}</p>
                      <Badge variant="mystical" className="text-sm py-1">
                        {stats.latestArchetype}
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t("home.recentReadings")}
            </h3>
            <Link href="/readings" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              {t("home.viewAll")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="space-y-3">
            {readingsLoading ? (
              [1,2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : recentReadings.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                <p>{t("home.emptyHistory")}</p>
              </div>
            ) : (
              recentReadings.map(reading => (
                <Link key={reading.id} href={`/readings/${reading.id}`} className="block group">
                  <Card className="hover:border-primary/30 transition-colors bg-card/50">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                            {reading.archetype}
                          </span>
                          <Badge variant="secondary" className="text-[10px] h-5 px-2">
                            {reading.kind}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{reading.title}</p>
                      </div>
                      <div className="text-xs text-muted-foreground/60 whitespace-nowrap pl-4 hidden sm:block">
                        {formatDate(reading.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
