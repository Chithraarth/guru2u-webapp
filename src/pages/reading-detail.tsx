import { useGetReading, getGetReadingQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { ReadingResult } from "@/components/reading-result";
import { OracleSpinner } from "@/components/oracle-spinner";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function ReadingDetailPage() {
  const [, params] = useRoute("/readings/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { t } = useTranslation();
  
  const { data: reading, isLoading, error } = useGetReading(id, {
    query: {
      enabled: !!id,
      queryKey: getGetReadingQueryKey(id)
    }
  });

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <Link href="/readings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("common.backToArchives")}
        </Link>
      </div>

      {isLoading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <OracleSpinner message={t("detail.loading")} />
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5 text-center p-8">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-xl font-display font-medium text-destructive">{t("detail.notFoundTitle")}</h3>
            <p className="text-muted-foreground">{t("detail.notFoundDesc")}</p>
            <Link href="/readings" className="inline-block mt-4 text-primary hover:underline">
              {t("detail.returnToArchives")}
            </Link>
          </CardContent>
        </Card>
      ) : reading ? (
        <ReadingResult reading={reading} />
      ) : null}
    </div>
  );
}
