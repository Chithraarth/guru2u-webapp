import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { downscaleImage, stripBase64Prefix } from "@/lib/utils";
import { Card } from "./ui/card";

interface ImageUploaderProps {
  onImageReady: (base64: string, mimeType: string) => void;
  isPending?: boolean;
  label?: string;
  kind?: "face" | "palm";
}

export function ImageUploader({ onImageReady, isPending, label, kind = "face" }: ImageUploaderProps) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      // Downscale and get base64
      const base64 = await downscaleImage(file, 1024);
      onImageReady(base64, file.type);
    } catch (err) {
      console.error("Failed to process image", err);
    }
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  if (previewUrl) {
    return (
      <div className="relative w-full max-w-sm mx-auto group">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-muted/50">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="icon" onClick={clearImage} disabled={isPending} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
            {/* Handled by parent's oracle spinner usually, but good to have a tint */}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden border-dashed border-2 bg-transparent hover:bg-muted/30 transition-colors">
      <div className="p-8 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {kind === "face" ? <Camera className="w-10 h-10" /> : <ImageIcon className="w-10 h-10" />}
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="font-display text-xl font-medium">{label ?? t("uploader.defaultLabel")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("uploader.hint")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            variant="mystical" 
            className="w-full" 
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="me-2 w-4 h-4" />
            {t("uploader.takePhoto")}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="me-2 w-4 h-4" />
            {t("uploader.uploadFile")}
          </Button>
        </div>

        <input 
          type="file" 
          accept="image/*" 
          capture="user" 
          className="hidden" 
          ref={cameraInputRef}
          onChange={handleFileChange}
        />
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </Card>
  );
}
