const simpleGit = require('simple-git');
const shell  = require("shelljs");
const git = simpleGit();

async function main() {
    git.clone("https://github.com/oskardudycz/event-sourcing-newsletter.git", "./temp");
    
    shell.cp('-R', './temp/content/pages', 'content/newsletter-pl');
}

main().then();