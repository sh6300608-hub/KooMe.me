import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://koomi.me";
  const routes = ["/", "/about", "/work", "/skills", "/certificates", "/education", "/goals", "/contact", "/resume/software-developer"];
  return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "weekly", priority: route === "/" ? 1 : 0.7 }));
}
