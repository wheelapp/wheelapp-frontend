// Legacy route that proxies API requests to Wheelmap Classic API. To be removed as soon as the
// new OSM database + backend works.

// Rewrites the path:
//
// /api/nodes/.../update_toilet.js?api_key=...
//
// ->
//
// http://classic.wheelmap.org/nodes/.../update_toilet.js?api_key=...

import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
  target: process.env.REACT_APP_LEGACY_API_BASE_URL,
  changeOrigin: true,
  pathRewrite: (path: string) => path.replace(/api\//, ''),
});
