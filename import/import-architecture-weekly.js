const simpleGit = require("simple-git");
const shell = require("shelljs");
const git = simpleGit();

(async () => {
    try{
        shell.rm("-rf", "./temp/ArchitectureWeekly");
        await git.clone("https://github.com/oskardudycz/ArchitectureWeekly.git", "./temp/ArchitectureWeekly");
        
        shell.rm("-rf", "content/architecture-weekly");
        shell.mkdir("content/architecture-weekly");
        // shell.cp("-R", "./temp/content/posts/", "content/newsletter-pl");
        shell.touch("content/architecture-weekly/.gitkeep");

        console.log("SUCCESS! ArchitectureWeekly import succeeded.")
    } catch(error) {
        console.log(`ERROR! Failed to import ArchitectureWeekly repo! \n${error}`);
    }
})()