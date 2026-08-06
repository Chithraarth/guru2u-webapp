import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center border-dashed bg-transparent border-2 border-primary/20">
        <CardContent className="pt-12 pb-12 space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold">
              {t('notFound.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('notFound.desc')}
            </p>
          </div>
          
          <Button asChild variant="mystical" className="mt-4">
            <Link href="/">{t('notFound.returnHome')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
