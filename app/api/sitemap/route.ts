const BASE_URL = "https://loja-atlas-rp.vercel.app";

const routes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/historia", priority: "0.9", changefreq: "monthly" },
  { path: "/eventos", priority: "0.9", changefreq: "weekly" },
  { path: "/sobre", priority: "0.8", changefreq: "monthly" },
];

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const urls = routes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
