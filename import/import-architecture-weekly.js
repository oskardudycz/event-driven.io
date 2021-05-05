const simpleGit = require("simple-git");
const shell = require("shelljs");
const git = simpleGit();

(async () => {
  try {
    const repoUrl =
      process.env.ARCHITECTURE_WEEKLY_REPO_URL ||
      "https://github.com/oskardudycz/ArchitectureWeekly.git";
    shell.rm("-rf", "./temp/ArchitectureWeekly");
    await git.clone(repoUrl, "./temp/ArchitectureWeekly");

    shell.rm("-rf", "content/architecture-weekly");
    shell.mkdir("content/architecture-weekly");
    shell.cp("-R", "./temp/ArchitectureWeekly/.", "content/architecture-weekly/");
    shell.touch("content/architecture-weekly/.gitkeep");

    console.log("SUCCESS! ArchitectureWeekly import succeeded.");
  } catch (error) {
    console.log(`ERROR! Failed to import ArchitectureWeekly repo! \n${error}`);
  }
})();
