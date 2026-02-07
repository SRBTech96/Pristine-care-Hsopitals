/**
 * Dynamic Sitemap Generation
 * Ensures search engines can crawl all pages
 */

export async function GET() {
  const baseUrl = "https://pristinehospital.com";

  const staticPages = [
    "",
    "/about",
    "/services",
    "/doctors",
    "/contact",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
           xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
     ${staticPages
       .map((page) => {
         let changefreq = "weekly";
         let priority = "0.8";

         if (page === "") {
           changefreq = "daily";
           priority = "1.0";
         } else if (page === "/doctors") {
           changefreq = "weekly";
           priority = "0.9";
         } else if (page === "/services") {
           changefreq = "monthly";
           priority = "0.7";
         }

         return `
     <url>
       <loc>${baseUrl}${page}</loc>
       <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
       <changefreq>${changefreq}</changefreq>
       <priority>${priority}</priority>
     </url>`;
       })
       .join("")}
   </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
