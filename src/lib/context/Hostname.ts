import { IncomingMessage } from 'http';

export type HostnameInfo = {
  hostname: string;
  protocol: string;
  pathname: string;
  absoluteUrl: string;
};

export function getHostnameInfoIsometric(req?: IncomingMessage): HostnameInfo {
  const hostname =
    req?.headers?.host?.replace(/:.*$/, '') ?? window.location.hostname;
  const protocol = hostname === 'localhost' ? 'http' : 'https';
  // Next.js hands over a relative URL here
  const pathname = req?.url || window.location.pathname;
  const absoluteUrl = new URL(
    `${protocol}://${hostname}${pathname}`,
  ).toString();
  return {
    hostname,
    protocol,
    pathname,
    absoluteUrl,
  };
}
