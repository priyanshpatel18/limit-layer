import fs from "fs";
import type { MetadataRoute } from "next";
import path from "path";

const URL = "https://limitlayer.superteam.life";
const baseDir = "app";
const dynamicDirs = [""];
const excludeDirs = ["(private)"];

function getRoutes(): MetadataRoute.Sitemap {
  const fullPath = path.join(process.cwd(), baseDir);
  const routes: MetadataRoute.Sitemap = [];
  const processedDirs: Set<string> = new Set();

  function processDirectory(dirPath: string, routePrefix: string) {
    if (processedDirs.has(dirPath)) {
      return;
    }

    processedDirs.add(dirPath);

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    if (entries.length === 0) {
      return;
    }

    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const isParenthetical = entry.name.startsWith("(") && entry.name.endsWith(")");
        const newRoutePrefix = isParenthetical ? routePrefix : `${routePrefix}/${entry.name}`;

        if (excludeDirs.includes(entry.name)) {
          return;
        }

        if (!dynamicDirs.includes(entry.name)) {
          routes.push({
            url: `${URL}${newRoutePrefix}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
          });
        }

        if (dynamicDirs.includes(entry.name)) {
          const subDir = path.join(dirPath, entry.name);
          const subEntries = fs.readdirSync(subDir, { withFileTypes: true });

          subEntries.forEach((subEntry) => {
            if (subEntry.isDirectory()) {
              processDirectory(path.join(subDir, subEntry.name), `${newRoutePrefix}/${subEntry.name}`);
            }
          });
        } else {
          processDirectory(path.join(dirPath, entry.name), newRoutePrefix);
        }
      }
    });
  }

  processDirectory(fullPath, "");

  if (routes.length === 0) {
    routes.push({
      url: URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });
  }

  const uniqueRoutes = Array.from(new Set(routes.map((route) => route.url))).map((url) =>
    routes.find((route) => route.url === url)
  );

  return uniqueRoutes as MetadataRoute.Sitemap;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return getRoutes();
}
