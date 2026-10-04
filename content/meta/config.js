const siteUrl = "https://event-driven.io";

module.exports = {
  siteTitle: "Event-Driven by Oskar Dudycz", // <title>
  shortSiteTitle: "Event-Driven.io", // <title> ending for posts and pages
  siteDescription:
    "Practical articles, training, and consulting about Event Sourcing, event-driven architecture, CQRS, and software architecture.",
  siteUrl,
  pathPrefix: "",
  siteImage: "/preview.jpg",
  siteLanguage: "en",
  // author
  authorName: "Oskar Dudycz",
  // info
  headerTitle: "Oskar Dudycz",
  headerSubTitle: "Pragmatycznie o programowaniu",
  // manifest.json
  manifestName: "Oskar Dudycz",
  manifestShortName: "ODudycz", // max 12 characters
  manifestStartUrl: "/index.html",
  manifestBackgroundColor: "white",
  manifestThemeColor: "#666",
  manifestDisplay: "standalone",

  // social
  socialLinks: {
    linkedin: { url: "https://www.linkedin.com/in/oskardudycz/" },
    github: { url: "https://github.com/oskardudycz" },
    youtube: { url: "https://www.youtube.com/channel/UC3M4_OgJS4lvZHVDzkOlxIg" },
    mastodon: { url: "https://hachyderm.io/@oskardudycz" },
    bluesky: { url: "https://bsky.app/profile/oskardudycz.bsky.social" },
    rss: { url: `${siteUrl}/rss.xml` },
  },
};
