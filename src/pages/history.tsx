import { useListReadings, useDeleteReading, getListReadingsQueryKey, getGetReadingStatsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Trash2, Library, ArrowRight, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function HistoryPage() {
  const { data: readings, isLoading } = useListReadings();
  const deleteReading = useDeleteReading();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(t("history.confirmDelete"))) return;

    deleteReading.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
          toast({ description: t("history.deleted") });
        },
        onError: () => {
          toast({ description: t("history.deleteFailed"), variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 border-b border-border/50 pb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Library className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">{t("history.title")}</h1>
          <p className="text-muted-foreground">{t("history.subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : !readings || readings.length === 0 ? (
        <div className="text-center py-20 px-4 space-y-6">
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Library className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-2xl font-display font-medium">{t("history.emptyTitle")}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {t("history.emptyDesc")}
          </p>
          <Button asChild variant="mystical">
            <Link href="/">{t("history.consultOracle")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {readings.map((reading) => (
            <Link key={reading.id} href={`/readings/${reading.id}`} className="group block">
              <Card className="hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 relative overflow-hidden">
                <CardContent className="p-0 flex items-stretch">
                  {/* Visual Indicator */}
                  <div className={`w-2 shrink-0 ${reading.kind === 'face' ? 'bg-primary' : reading.kind === 'palm' ? 'bg-accent' : 'bg-secondary-foreground'}`} />
                  
                  <div className="p-5 sm:p-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold border-primary/20 bg-background">
                          {reading.kind}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          {formatDate(reading.createdAt)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                          {reading.archetype}
                        </h3>
                        <p className="text-muted-foreground mt-1 line-clamp-1">{reading.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto mt-2 sm:mt-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10 relative"
                        onClick={(e) => handleDelete(e, reading.id)}
                        disabled={deleteReading.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="p-2 rounded-full bg-background border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
