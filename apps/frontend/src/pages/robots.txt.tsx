import type { GetServerSideProps } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://dova.dntech.id').replace(/\/$/, '');

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.write(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /auth\nDisallow: /cart\nDisallow: /checkout\nDisallow: /customer\nDisallow: /supplier\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  res.end();

  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
