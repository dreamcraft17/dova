/**
 * Next.js config — includes FeedLog proxy at /feedback.
 * @author Dozer (@dreamraft17) - Software Engineer
 */
const path = require('path');

/** FeedLog Nitro server (integrated under /feedback via rewrites). */
const feedlogOrigin = process.env.FEEDLOG_INTERNAL_URL || 'http://localhost:3010';

/** @type {import('next').NextConfig} */
module.exports = {
  turbopack: { root: path.resolve(__dirname, '../..') },
  async rewrites() {
    return [
      { source: '/feedback', destination: `${feedlogOrigin}/feedback` },
      { source: '/feedback/:path*', destination: `${feedlogOrigin}/feedback/:path*` },
    ];
  },
};
