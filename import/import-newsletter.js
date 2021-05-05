const simpleGit = require("simple-git");
const shell = require("shelljs");
const git = simpleGit();

(async () => {
  try {
    const repoUrl =
      process.env.NEWSLETTER_REPO_URL ||
      "https://github.com/oskardudycz/event-sourcing-newsletter.git";
    shell.rm("-rf", "./temp/event-sourcing-newsletter");
    await git.clone(repoUrl, "./temp/event-sourcing-newsletter");

    shell.rm("-rf", "content/newsletter-pl");
    shell.mkdir("content/newsletter-pl");
    shell.cp("-R", "./temp/event-sourcing-newsletter/content/posts/.", "content/newsletter-pl/");
    shell.touch("content/newsletter-pl/.gitkeep");

    console.log("SUCCESS! Newsletter import succeeded.");
  } catch (error) {
    console.log(`ERROR! Failed to import newsletter repo! \n${error}`);
  }
})();
