/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.shoppingcart.bd",
  generateRobotsTxt: true,
  exclude: [
    "/admin*",
    "/dashboard*",
    "/user-account*",
    "/checkout*",
    "/login*",
    "/register*",
    "/payment*",
  ],
  robotsTxtOptions: {
    additionalSitemaps: ["https://www.shoppingcart.bd/server-sitemap.xml"],
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
