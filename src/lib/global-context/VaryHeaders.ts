import { ServerResponse } from 'http';
import { Locale } from '../i18n';
import { UserAgent } from './UserAgent';

export function setVaryHeaders(
  res: ServerResponse,
  languageTags: Locale[],
  userAgent: UserAgent,
) {
  res.setHeader(
    'Vary',
    'X-Recognized-User-Agent, X-First-Content-Language, Content-Language',
  );

  if (languageTags[0]) {
    res.setHeader('X-First-Content-Language', languageTags[0].string);
    res.setHeader(
      'Content-Language',
      languageTags.map(l => l.string).join(', '),
    );
  }

  res.setHeader(
    'X-Recognized-User-Agent',
    userAgent.os.name || userAgent.ua.replace(/\/.*$/, ''),
  );
}
