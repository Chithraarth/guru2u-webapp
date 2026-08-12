import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { Layout } from '@/components/layout';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useEffect, useRef, useState } from 'react';

import Home from '@/pages/home';
import FaceReadingPage from '@/pages/face-reading';
import PalmReadingPage from '@/pages/palm-reading';
import VoiceReadingPage from '@/pages/voice-reading';
import AstroReadingPage from '@/pages/astro-reading';
import ComboReadingPage from '@/pages/combo-reading';
import HistoryPage from '@/pages/history';
import ReadingDetailPage from '@/pages/reading-detail';
import NotFound from '@/pages/not-found';
import SignInPage from '@/pages/sign-in';
import SignUpPage from '@/pages/sign-up';
import { LanguageGate, hasChosenLocale } from '@/components/language-gate';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/face">{() => <Protected><FaceReadingPage /></Protected>}</Route>
        <Route path="/palm">{() => <Protected><PalmReadingPage /></Protected>}</Route>
        <Route path="/voice">{() => <Protected><VoiceReadingPage /></Protected>}</Route>
        <Route path="/astro">{() => <Protected><AstroReadingPage /></Protected>}</Route>
        <Route path="/insight">{() => <Protected><ComboReadingPage /></Protected>}</Route>
        <Route path="/readings">{() => <Protected><HistoryPage /></Protected>}</Route>
        <Route path="/readings/:id">{() => <Protected><ReadingDetailPage /></Protected>}</Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppShell() {
  const { user } = useAuth();
  const prevUidRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const uid = user?.uid ?? null;
    if (prevUidRef.current !== undefined && prevUidRef.current !== uid) {
      queryClient.clear();
    }
    prevUidRef.current = uid;
  }, [user?.uid]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

function App() {
  const [localeChosen, setLocaleChosen] = useState(() => hasChosenLocale());

  if (!localeChosen) {
    return <LanguageGate onDone={() => setLocaleChosen(true)} />;
  }

  return (
    <WouterRouter base={basePath}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
