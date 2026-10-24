import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { SiteLayout } from '@/components/site-layout';

import LandingPage from '@/pages/landing';
import PrivacyPage from '@/pages/privacy';
import DeleteAccountPage from '@/pages/delete-account';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * guru2u.com is a marketing site: the landing page plus the legal pages the
 * app stores link to. Readings and sign-in live only in the mobile app, so any
 * other path (including old web-app links) goes back to the landing page.
 */
function App() {
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/privacy">{() => <SiteLayout><PrivacyPage /></SiteLayout>}</Route>
        <Route path="/delete-account">{() => <SiteLayout><DeleteAccountPage /></SiteLayout>}</Route>
        <Route><Redirect to="/" replace /></Route>
      </Switch>
    </WouterRouter>
  );
}

export default App;
