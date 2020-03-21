import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript
} from 'next/document';
import * as React from 'react';
import { ServerStyleSheet } from 'styled-components';
import CommonHead from '../components/MapPage/CommonHead';
import { getCachedTranslationsForAcceptHeader } from '../components/MapPage/context/LanguageTagResolution';
import MatomoScriptTag from '../components/MapPage/MatomoScriptTag';

interface Props {
  saveSomeBytesByRenderingEmptyBody: boolean;
  locale: string;
  styleTags: Array<React.ReactElement<{}>>;
}

export default class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const isTwitterBot = ctx.req?.headers['user-agent'].match(/Twitterbot/i);
    const saveSomeBytesByRenderingEmptyBody = isTwitterBot;
    const httpAcceptLanguageHeader = ctx.req?.headers['accept-language'];
    const overridenLanguageTags =
      ctx.query['language'] || ctx.query['locale'] || ctx.query['lang'];
    const resolvedTranslations = getCachedTranslationsForAcceptHeader(
      httpAcceptLanguageHeader,
      overridenLanguageTags?.[0]
    );
    const languageTag = resolvedTranslations[0]?.headers.language ?? 'en-US';

    // Collect initial style tags by rendering the app once with styled-components
    const sheet = new ServerStyleSheet();
    ctx.renderPage(App => props => {
      return sheet.collectStyles(<App {...props} />);
    });
    const styleTags = sheet.getStyleElement();

    return {
      ...initialProps,
      languageTag,
      styleTags,
      saveSomeBytesByRenderingEmptyBody
    };
  }

  render() {
    const { locale, saveSomeBytesByRenderingEmptyBody } = this.props;

    return (
      <Html lang={locale}>
        <Head>
          {this.props.styleTags}

          <MatomoScriptTag />

          <script src="/api/clientEnv.js"></script>
        </Head>
        <body>
          {saveSomeBytesByRenderingEmptyBody && <Main />}
          <NextScript />
        </body>
      </Html>
    );
  }
}
