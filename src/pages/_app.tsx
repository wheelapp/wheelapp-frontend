// babel-preset-react-app uses useBuiltIn "entry". We therefore need an entry
// polyfill import to be replaced with polyfills we need for our targeted browsers.
import 'core-js/stable';
// import "regenerator-runtime/runtime";
// import apm from '../lib/apm';
import * as React from 'react';
import beginTrackingPageViews from '../lib/beginTrackingPageViews';
import { AppProps } from 'next/app';

import { GetServerSideProps } from 'next';
import env from '../../lib/env';

import EmbedModeDeniedDialog from '../EmbedModeDeniedDialog';

import { App } from '../../lib/api/model/App';
import CommonHead from '../components/MapPage/CommonHead';
import GlobalContext from '../lib/context/GlobalContext';

interface Props {
  currentAccessibilityApp: App;
  children: React.ReactNode;
}
beginTrackingPageViews();

// if (typeof window !== 'undefined') {
//   require('../lib/apm/ClientSide');
// }

export default function AccessibilityApp({ Component, pageProps }: AppProps) {
  const baseUrl = env.REACT_APP_ACCESSIBILITY_APPS_BASE_URL;
  const usedHostName = overriddenAppId || hostName;

  return (
    <>
      <CommonHead />
      <GlobalContext.Provider value={appContext}>
        <Component {...pageProps} />
      </GlobalContext.Provider>
      <EmbedModeDeniedDialog language={preferredLanguage} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  let localeStrings: string[] = [];

  return {
    currentAccessibilityApp,
    embedModeDenied,
    preferredLanguage: localeStrings[0],
  };
};

AccessibilityApp.getInitialProps = async appContext => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  return { ...appProps };
};
