import { useState } from "react";
import { useCreatePalmReading, getListReadingsQueryKey, getGetReadingStatsQueryKey } from "@workspace/api-client-react";
import { ImageUploader } from "@/components/image-uploader";
import { ReadingResult } from "@/components/reading-result";
import { OracleSpinner } from "@/components/oracle-spinner";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function PalmReadingPage() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [readingResult, setReadingResult] = useState<any>(null);
  
  const createReading = useCreatePalmReading();

  const handleImageReady = (base64: string, mimeType: string) => {
    createReading.mutate(
      { data: { imageBase64: base64, mimeType, language: i18n.language } },
      {
        onSuccess: (data) => {
          setReadingResult(data);
          queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
        },
        onError: (err: any) => {
          if (err?.status === 402) {
            window.location.assign(`${import.meta.env.BASE_URL}pricing?limit=reached`);
            return;
          }
          toast({
            title: t("palm.errorTitle"),
            description: err.message || t("palm.errorDesc"),
            variant: "destructive",
          });
        }
      }
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
          <OracleSpinner message={t("palm.loading")} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-display font-bold">{t("palm.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {t("palm.desc")}
            </p>
          </div>
          
          <ImageUploader 
            onImageReady={handleImageReady} 
            isPending={createReading.isPending}
            label={t("palm.uploadLabel")}
            kind="palm"
          />
        </div>
      )}
    </div>
  );
}
