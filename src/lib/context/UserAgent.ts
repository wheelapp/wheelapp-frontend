import HamsterCache from '@sozialhelden/hamster-cache';
import UAParser from 'ua-parser-js';
import { IncomingMessage } from 'http';

export interface UserAgent {
  os: {
    name?: string;
    version?: string;
  };
  ua: string;
}

export const cache = new HamsterCache<string, UserAgent>({
  defaultTTL: 10 * 60 * 1000,
  maximalItemCount: 10000,
  evictExceedingItemsBy: 'lru',
});

setInterval(() => cache.evictExpiredItems(), 10000);

export function getUserAgentFromString(userAgentString: string): UserAgent {
  const parser = new UAParser(userAgentString.slice(0, 512));
  return parser.getResult();
}

export function getUserAgentFromIncomingMessage(
  req?: IncomingMessage,
): UserAgent {
  const userAgentString =
    req?.headers?.['user-agent'] ?? window.navigator.userAgent;
  return getUserAgentFromString(userAgentString);
}

export function isTouchDevice(userAgent: UserAgent) {
  return (
    window?.navigator.maxTouchPoints > 0 || // works on client only
    userAgent.os.name === 'iOS' || // works on client and server
    userAgent.os.name === 'Android' // works on client and server
  );
}
