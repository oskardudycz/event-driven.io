const simpleGit = require("simple-git");
const shell = require("shelljs");
const git = simpleGit();

async function main() {
    try{
        git.clone("https://github.com/oskardudycz/event-sourcing-newsletter.git", "./temp");
        
        shell.rm("-rf", "content/newsletter-pl");
        shell.cp("-R", "./temp/content/posts/", "content/newsletter-pl");
        shell.touch("content/newsletter-pl/.gitkeep");

        console.log("SUCCESS! Newsletter import succeeded.")
    } catch(error) {
        console.log(`ERROR! Failed to import newsletter repo! \n${error}`);
    }
}

main().then();