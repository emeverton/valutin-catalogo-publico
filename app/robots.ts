import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard', '/editor', '/login', '/atendimento', '/wa', '/whatsapp'] }, sitemap: 'https://www.valutin.com.br/sitemap.xml' };
}
