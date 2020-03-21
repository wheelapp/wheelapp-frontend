// Legacy route that proxies API requests to Wheelmap Classic API. To be removed as soon as the
// new OSM database + backend works.

import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
  target: process.env.REACT_APP_LEGACY_API_BASE_URL,
  changeOrigin: true,
});
