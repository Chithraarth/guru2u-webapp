import { Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface OracleSpinnerProps {
  message?: string;
  className?: string;
}

export function OracleSpinner({ message, className }: OracleSpinnerProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-6", className)}>
      <div className="relative">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
        
        {/* Spinning elements */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border-2 border-accent/20 border-b-accent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          
          {/* Core icon */}
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="font-display text-xl font-medium mystical-text-gradient">{message ?? t("spinner.default")}</p>
        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
          {t("spinner.hint")}
        </p>
      </div>
    </div>
  );
}
