// Rewrites the path:
//
// /api/nodes/.../update_wheelchair.js?api_key=...
//
// ->
//
// http://classic.wheelmap.org/nodes/.../update_wheelchair.js?api_key=...

import { createProxyMiddleware } from 'http-proxy-middleware';

export default createProxyMiddleware({
  target: process.env.REACT_APP_LEGACY_API_BASE_URL,
  changeOrigin: true,
  pathRewrite: (path: string) => path.replace(/api\//, ''),
});
