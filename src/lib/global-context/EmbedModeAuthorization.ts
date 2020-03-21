import { App } from '../api/model/App';
import { EmbedToken } from '../api/model/ClientSideConfiguration';
import { ServerResponse } from 'http';

export default function isEmbedTokenValid(
  embedToken: string,
  appEmbedTokens: EmbedToken[],
) {
  if (embedToken === '' || appEmbedTokens.length === 0) {
    return false;
  }
  const matchingToken = appEmbedTokens.find(
    token => token.token === embedToken,
  );
  if (!matchingToken) {
    return false;
  }
  const now = new Date();
  const expiryDate = new Date(matchingToken.expiresOn);
  return expiryDate > now;
}

/**
 * Sets response headers on a HTTP response to limit <iframe> embed usage of an accessibility
 * app to domains specified in the app's configuration.
 *
 * @param embedToken The embed token string used to authorize iframe usage
 * @param app The accessibility app used for embedding
 * @param res A NodeJS HTTP response where headers should be set
 *
 * @returns `true` when embed usage has been denied. The UI can show a dialog in this case, for
 * example.
 */
export function setResponseHeadersForEmbedMode(
  embedToken: string,
  app: App,
  res: ServerResponse,
): boolean {
  if (!embedToken) {
    res.setHeader('X-Frame-Options', 'deny');
    return false;
  }

  const { embedTokens, allowedBaseUrls = [] } = app.clientSideConfiguration;
  const validEmbedTokenProvided = isEmbedTokenValid(embedToken, embedTokens);

  res.setHeader(
    'Content-Security-Policy',
    `frame-ancestors file://* ${allowedBaseUrls.join(' ')}`,
  );
  return !validEmbedTokenProvided;
}
