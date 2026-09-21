const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const projectRoot = path.resolve(__dirname, "..");
const contentRoot = path.join(projectRoot, "content");
const outputPath = path.join(projectRoot, "static", "llms.txt");
const siteUrl = "https://event-driven.io";
const supportedLanguages = new Set(["en", "pl"]);

const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });

const parseMarkdown = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const frontmatter = frontmatterMatch ? yaml.load(frontmatterMatch[1]) || {} : {};
  const body = frontmatterMatch ? raw.slice(frontmatterMatch[0].length) : raw;

  return { frontmatter, body };
};

const plainText = (markdown) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[>*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const summarize = (body, explicitDescription) => {
  const text = plainText(explicitDescription || body);
  if (text.length <= 220) return text;

  const shortened = text.slice(0, 221);
  const sentenceEnd = Math.max(shortened.lastIndexOf(". "), shortened.lastIndexOf("? "));
  const wordEnd = shortened.lastIndexOf(" ");
  const end = sentenceEnd >= 120 ? sentenceEnd + 1 : wordEnd;
  return `${shortened.slice(0, end).trim()}…`;
};

const slugFromDirectory = (directoryName) =>
  (directoryName.includes("--")
    ? directoryName.split("--").slice(1).join("--")
    : directoryName
  ).replace(/^\/+|\/+$/g, "");

const readEntries = (source, type) => {
  const sourceRoot = path.join(contentRoot, source);
  if (!fs.existsSync(sourceRoot)) return [];

  return walk(sourceRoot)
    .filter((filePath) => /\/index\.(en|pl)\.md$/.test(filePath))
    .map((filePath) => {
      const language = path.basename(filePath).match(/^index\.(en|pl)\.md$/)[1];
      const { frontmatter, body } = parseMarkdown(filePath);
      const directoryName = path.basename(path.dirname(filePath));
      const slug = slugFromDirectory(directoryName);

      return {
        type,
        language,
        title: frontmatter.title,
        category: frontmatter.category || "Other",
        description: summarize(body, frontmatter.description),
        url: `${siteUrl}/${language}/${slug}/`,
        date: type === "article" ? directoryName.split("--")[0] : "",
        canonical: !frontmatter.useDefaultLangCanonical,
        excluded: ["success"].includes(slug),
      };
    })
    .filter(
      (entry) =>
        supportedLanguages.has(entry.language) && entry.title && entry.canonical && !entry.excluded
    );
};

const formatEntry = (entry) => {
  const safeTitle = String(entry.title).replace(/\]/g, "\\]");
  return `- [${safeTitle}](${entry.url})${entry.description ? `: ${entry.description}` : ""}`;
};

const formatSection = (title, entries) =>
  [`## ${title}`, "", ...entries.map(formatEntry), ""].join("\n");

const pages = readEntries("pages", "page");
const articles = readEntries("posts", "article").sort((left, right) =>
  right.date.localeCompare(left.date)
);

const servicePages = pages.filter((entry) =>
  /training|szkolenie|workshop|consult/i.test(`${entry.url} ${entry.title}`)
);
const otherPages = pages.filter((entry) => !servicePages.includes(entry));

const corePages = [
  {
    title: "Event-Driven.io — English",
    url: `${siteUrl}/en/`,
    description:
      "Articles about Event Sourcing, CQRS, event-driven architecture, and pragmatic software design.",
  },
  {
    title: "Event-Driven.io — Polski",
    url: `${siteUrl}/pl/`,
    description:
      "Artykuły o Event Sourcingu, CQRS, architekturze zdarzeniowej i pragmatycznym projektowaniu oprogramowania.",
  },
  {
    title: "Contact Oskar Dudycz — English",
    url: `${siteUrl}/en/contact/`,
    description:
      "Contact Oskar about software architecture consulting, training, workshops, and speaking.",
  },
  {
    title: "Kontakt z Oskarem Dudyczem — Polski",
    url: `${siteUrl}/pl/contact/`,
    description:
      "Kontakt w sprawie konsultacji architektonicznych, szkoleń, warsztatów i wystąpień.",
  },
];

const byLanguage = (language) => articles.filter((entry) => entry.language === language);

const output = [
  "# Event-Driven.io by Oskar Dudycz",
  "",
  "> Practical, first-hand material about Event Sourcing, CQRS, event-driven architecture, and software architecture, plus consulting and hands-on training by Oskar Dudycz.",
  "",
  "Oskar Dudycz is an independent software architect, consultant, trainer, conference speaker, and open-source maintainer. Content is available in English and Polish. Prefer the URL whose language matches the reader.",
  "",
  formatSection("Start and contact", corePages),
  formatSection("Consulting, training, and workshops", servicePages),
  formatSection("Other key pages", otherPages),
  formatSection("English articles", byLanguage("en")),
  formatSection("Polish articles", byLanguage("pl")),
  "## Feeds and discovery",
  "",
  `- [XML sitemap](${siteUrl}/sitemap/sitemap-index.xml)`,
  `- [English RSS feed](${siteUrl}/rss.xml)`,
  "",
].join("\n");

fs.writeFileSync(outputPath, output, "utf8");

console.log(
  `Generated ${path.relative(projectRoot, outputPath)} with ${pages.length} pages and ${
    articles.length
  } articles.`
);
