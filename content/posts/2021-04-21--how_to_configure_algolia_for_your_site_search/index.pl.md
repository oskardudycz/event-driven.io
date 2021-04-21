---
title: How to enhance and configure your site search with Algolia?
category: "Tools"
cover: 2020-04-21-cover.png
author: oskar dudycz
---

![cover](2020-04-21-cover.png)

Some time ago, I wrote on how to create documentation without the pain ([read it here](/pl/how_to_successfully_do_documentation_without_maintenance_burden)). Documentation is something that has been one of the main tasks since I joined Event Store. Tedious, painstaking work, still it has to be done. Year ago, a lot of documentation for EventStoreDB was missing. Now, thanks to collaborative work, it's much better. We are filling the hole each week. **Recently, we filled a hole deep as the Lake Baikal: content search**.

At Event Store, we use [VuePress](https://vuepress.vuejs.org/) as the documentation engine. It is a static HTML generator written in Vue. Overall great thing. It looks nice, and it's extendible - #IRecommendIt. VuePress has a built-in content search engine. Unfortunately, it is elementary - #IDontReccommendIt. We used it for some time because something is better than nothing. However, frankly, documentation without a proper search is a poor one.

After a short research, we found that we will use a ready-made tool - [Algolia](https://www.algolia.com/). It is a SaaS solution that allows a website's content indexing and advanced text search. It also takes care of all the basic stuff like case-insensitive searches, typos correction, phrase searches, etc. The fact that it is a SaaS solution means that you don't have to build your architecture and worry about operational issues. It just does the work.

Of course, it's not so perfect that you don't have to do anything. In theory, Algolia has a free autoindexing program. You can sign in, and when you are accepted, Algolia will do scraping and indexing for you. However, it has limited options to adapt to your needs. The other option is to scrap and send data to Algolia on your own. Then we have much more customisation options. How to do it? The easiest way is with a Docker image predefined by Algolia.

Before we get to Docker, let's first define the configuration. We need to set up a JSON file (e.g. _config.json_). It can look like this:

```json
{
  // name of the index in Algolia
  "index_name": "scraper-test",
  // url of the page to be indexed
  "start_urls": ["https://developers.eventstore.com/"],
  // selectors, each lvl is a header
  "selectors": {
    "lvl0": ".sidebar h3.version",
    "lvl1": {
      "selector": ".sidebar-heading.open span",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl2": {
      "selector": ".content__default h1",
      "strip_chars": "#"
    },
    "lvl3": {
      "selector": ".content__default h2",
      "strip_chars": "#"
    },
    "lvl4": {
      "selector": ".content__default h3",
      "strip_chars": "#"
    },
    "lvl5": {
      "selector": ".content__default h4",
      "strip_chars": "#"
    },
    // page content selector
    "text": ".content__default p, .content__default li",
    // the language of the text
    "lang": {
      "selector": "/html/@lang",
      "type": "xpath",
      "global": true
    }
  },
  "custom_settings": {
    "attributesForFaceting": [
      "lang"
    ]
  }
}
```

Let's define the _ ". Env" _ file with the necessary environment variables for the scraping process. They are keys and indexes names that we should get from Algolia settings:

```
ALGOLIA_APPLICATION_ID = PASTE_HERE_YOUR_AGLOLIA_APPLICATION_ID
ALGOLIA_WRITE_API_KEY = PASTE_HERE_YOUR_ALGOLIA_WRITE_API_KEY
ALGOLIA_SITE_URL = https: //developers.eventstore.com/
ALGOLIA_INDEX_NAME = Documentation
```

Algolia has several types of API keys to ensure security. We'll use a separate read-only API Key for search and write for uploading the site data.

Let's define an auxiliary script _ "scrape.sh" _, which we will run for  scraping and indexing our site (if you use Windows, you need [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10)):

```bash
if [ -f .env ]; then
    export $(xargs < .env)
fi

docker run \
    -e APPLICATION_ID=$(printenv ALGOLIA_APPLICATION_ID) \
    -e API_KEY=$(printenv ALGOLIA_WRITE_API_KEY) \
    -e CONFIG="$(cat config.json | jq '.start_urls=[env.ALGOLIA_SITE_URL]' | jq '.index_name=env.ALGOLIA_INDEX_NAME' | jq -r tostring)" \
    algolia/docsearch-scraper:v1.13.0
```

We're running the Docker image prepared by Algolia. Before we do that, we read the environment variables from the _ ". Env"_ file. This image needs the service keys (*APPLICATION_ID* and *API_KEY*) to boot. Additionally, we read the content of our configuration file:
- *cat config.json*: download content.
- *jq '.start_urls = [env.ALGOLIA_SITE_URL]'*: replace the page URL from config with value from the environment variable.
- * jq '.index_name = env.ALGOLIA_INDEX_NAME' *:  replace the Algolia index name from config with value from the environment variable.
- *jq -r tostring* converts JSON to a flattened string.

Why do we need to manipulate the values from _config.json_? Ultimately, we wouldn't like to be calling that manually. It would be better if it happens automatically after the website was deployed. How to do it? For example, via GitHub Actions. We can define new workflow - e.g. as *algolia-scraper.yml*:

```yaml
name: algolia-scraper
on:
  push:
    branches:
      - master
  check_suite:
    types: [completed]
  workflow_dispatch:
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: check out code 🛎
        uses: actions/checkout@v2
      - name: scrape the site 🧽
        env:
          ALGOLIA_APPLICATION_ID: ${{ secrets.ALGOLIA_APPLICATION_ID }}
          ALGOLIA_WRITE_API_KEY: ${{ secrets.ALGOLIA_WRITE_API_KEY }}
          ALGOLIA_SITE_URL: ${{ secrets.ALGOLIA_SITE_URL }}
          ALGOLIA_INDEX_NAME: ${{ secrets.ALGOLIA_INDEX_NAME }}
        run: |
          cd .algolia
          touch .env
          ./scrape.sh
```

Thanks to that, we can replace the Algolia configuration without changing the scraping script code. Tastes? The trigger is run after the merge to the main branch. 

Why *touch .env*? For the build, this file will not exist. We have the variable values ​​defined above based on the *secrets* of the repository. We should never put these API keys in a Git repository. *.Env* file for the convenience of local work.

If you want to see the PR where I implemented it, check the documentation repo: https://github.com/EventStore/documentation/pull/306.

You can check the search results at https://developers.eventstore.com/. Yes, I know the popup look&feel is questionable, but it's *"good enough"*.

If you want to play with Algolia, it also has a free version (up to 10,000 searches per month).

I hope you found my post interesting. Besides the Algolia configuration, I wanted to show you that sometimes it is worth using ready-made things instead of creating everything on your own. I showed the potential decision-making process, plus a complete example of how to automate work with tools. **You can take it from there and use it for your documentation, blog or even application data.**

Cheers!

Oskar