import NextHead from 'next/head';
import OpenGraph from './OpenGraph';
import TwitterMeta from './TwitterMeta';
import AlternateLocaleLinks from './AlternateLocaleLinks';
import { translatedStringFromObject } from '../../lib/i18n';
import FacebookMeta from '../FacebookMeta';
import { t } from 'ttag';
import { ClientSideConfiguration } from '../../lib/api/model/ClientSideConfiguration';
import { useContext } from 'react';
import CurrentAppContext from './context/CurrentAppContext';
import HostnameContext from './context/HostnameContext';

export default function CommonHead() {
  const app = useContext(CurrentAppContext);

  if (!app) {
    throw new Error('Current app must be defined in context');
  }

  const hostnameInfo = useContext(HostnameContext);

  const { textContent, meta } = app.clientSideConfiguration;
  const { name: productName, description } = textContent.product;
  const { twitter, facebook } = meta;
  let translatedProductName = translatedStringFromObject(productName);
  let translatedDescription = translatedStringFromObject(description);

  return (
    <NextHead>
      <meta charSet="utf-8" key="charSet" />

      {/* Google Bots */}
      <meta content="follow index" name="robots" />

      {/* iOS link to "native" app and configuration for web app */}
      <meta name="apple-mobile-web-app-title" content={translatedProductName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />

      <link rel="apple-touch-icon" href="/images/wheely_big.jpg" />
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href="/images/wheely_big.jpg"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href="/images/wheely_big.jpg"
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/images/wheely_big.jpg"
      />

      {/*
      Move viewport meta into Head from next/head to allow deduplication to work. Do not rely on deduplication by key,
      as React.mapChildren will prefix keys with ".$", but the default keys in next are not prefixed. Deduplication by
      name works fine.
      */}
      <meta
        name="viewport"
        content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=2.0, minimum-scale=1.0, viewport-fit=cover"
      />

      <AlternateLocaleLinks />

      <link href="/search" rel="search" title={t`Search`} />
      <link href="/" rel="home" title={t`Homepage`} />

      {/* Misc */}
      <meta
        content={translatedStringFromObject(description)}
        name="description"
        key="description"
      />

      <link rel="shortcut icon" href={`/favicon.ico`} />

      {/* iOS app */}
      {(productName === 'Wheelmap' || productName['en'] === 'Wheelmap') && (
        <meta content="app-id=399239476" name="apple-itunes-app" />
      )}

      <OpenGraph
        productName={translatedProductName}
        title={translatedProductName}
        description={translatedDescription}
        url={hostnameInfo.absoluteUrl}
      />

      {twitter && (
        <TwitterMeta
          productName={translatedProductName}
          description={translatedDescription}
          twitter={twitter}
        />
      )}
      {facebook && <FacebookMeta {...facebook} />}
    </NextHead>
  );
}
