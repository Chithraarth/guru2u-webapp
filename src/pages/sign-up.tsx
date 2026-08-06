import { useTranslation } from 'react-i18next';
import { AuthPageShell } from '@/pages/sign-in';

export default function SignUpPage() {
  const { t } = useTranslation();
  return (
    <AuthPageShell
      mode="sign-up"
      title={t('auth.signUpTitle')}
      subtitle={t('auth.signUpSubtitle')}
      switchHref="/sign-in"
      switchText={t('mobile.auth.haveAccount')}
      switchLinkText={t('mobile.auth.signIn')}
    />
  );
}
