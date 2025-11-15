// Sitemap estático mínimo para SEO básico
export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date().toISOString();
  const routes = ['/', '/catalog', '/sell', '/about', '/contact', '/faq'];
  return routes.map((r) => ({ url: `${base}${r}`, lastModified: now }));
}
