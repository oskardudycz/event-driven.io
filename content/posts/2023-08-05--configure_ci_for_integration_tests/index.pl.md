---
title: A simple way to configure integration tests pipeline
category: "DevOps"
cover: 2023-08-05-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2023-08-05-cover.png)

**Continuing an effort to explain DevOps scenarios, today I'd like to show you a simple way to set up integration tests that I'm using in my sample repositories and Marten.**

**What are my assumptions?** It has to be straightforward, so anyone can run it easily (including me, I'm a simple guy). I wrote why it's important in [How to get started with Open Source?](/pl/how_to_start_with_open_source/). It has to be stable and allow easy change or add new configuration without much additional code. Also, I like to play with different stacks and technologies. I want easy and repeatable patterns when I play with new technology. It must also run in GitHub Actions, as this is my current Continuous Integration (_CI_) runner. That's essential, as those machines are underprovisioned and that puts limits.

**I'm running many of my tests as integration ones, as I'd like to trust that what I'm testing will actually work.** You can read a longer explanation of my attitude in [I tested it on production, and I'm not ashamed of it](/pl/i_tested_on_production/). Still, this post is not about why but how.

So, even though I'm not a massive fan of YAML, I like Docker Compose, as it [allows me to set up advanced configurations](/pl/tricks_on_how_to_set_up_related_docker_images/) in a declarative way quickly. Usually, that's something that I only change sometimes. Once I have the default, recommended setup, I can just run _docker-compose up_ and have my local environment ready. 

The benefit of Docker Compose is that most of the tools provide their container images; you can run it on any operating system and find a troubleshooting guide on the Internet.

**So, how to repeat that in GitHub actions? Actually, quite simple:**

```yml
name: Build and Test

on:
  push:
    branches:
      - main
  pull_request:

jobs:
    build:
        runs-on: ubuntu-latest

        steps:
            - name: Check Out Repo
              uses: actions/checkout@v3

            - name: Start containers
              run: docker-compose -f "docker-compose.yml" up -d

            # Do the other steps

            - name: Stop containers
              if: always()
              run: docker-compose -f "docker-compose.yml" down
```

It's a simple template, we checkout code, start containers, and in the end, we stop containers. GitHub Actions runners already have Docker preinstalled. I'm using _if: always()_; it's needed to ensure that the cleanup step will be run even if some step fails.

What to put in the _Do the other steps_ part? In general, it's: get dependencies, build them, and run tests. Of course, the details will depend on the environment you're in and your application. 

See the real-world examples in:
- [.NET](https://github.com/oskardudycz/EventSourcing.NetCore/blob/main/.github/workflows/build.dotnet.yml#L20)
- [Java](https://github.com/oskardudycz/EventSourcing.JVM/blob/main/.github/workflows/samples_event-sourcing-esdb-simple.yml#L35)

**An important note is to trim down the Docker Compose configuration for CI.** For local development, we might need containers with UIs like [PgAdmin](https://www.pgadmin.org/), [Kibana](https://www.elastic.co/kibana) or tools like Open Telemetry collectors etc. For CI, we don't need them, and they will make setup slower and can even break it by eating too many resources. We can trim it by preparing a dedicated Docker Compose config for CI, but then we need to synchronise those configs. Better is to use [Docker Compose profiles](https://docs.docker.com/compose/profiles/), which will allow us to exclude what we need by default and keep the configuration in a single file.

**Why am I not using [Test Containers](https://testcontainers.com/)?** I'd like to and trying to do that (see [.NET](https://github.com/oskardudycz/EventSourcing.NetCore/pull/221) and [Node.js](https://github.com/oskardudycz/EventSourcing.NodeJS/blob/main/samples/hotelManagement/src/core/testing/eventStoreDB/eventStoreDBContainer.ts) samples). Still, I'm not getting an enough stable solutions. Why?

TestContainers are intriguing tool. They try to simplify container-based integration testing. The promise is that you can get or configure your docker configuration in code, and the tool will handle all initialisation, clean up etc. It should also do needed optimisations and default recommended setup. 

**That's the promise, but my reality was a bit different.**

Docker resources initialisation costs a lot. You need to start the image, set up networks, volumes, etc. They will run extremely slowly if you try to do it for each test. You will get isolation, of course, but at a high cost. And you can achieve isolation differently and pay less. For instance, if you're using a relational database, you can create a new schema for a test class or even a new database. It'll still be cheaper than spinning up a new container.

If you run too many containers in the GitHub Actions machine, it may become infinitely idle or die. So you must be careful with your setup, as you may accidentally get false/positives after adding a new set of tests. So funnily, the more test isolation we have, the less isolated will be test run (because of eating shared resources on test runner).

Also, if you're spinning up the new container, that's ephemeral, then if the test fails and you'd like to troubleshoot it, then you want easy access to its data. If a container is cleaned up automatically by TestContainers, you won't have access to it. 

Sometimes you also might want to use tests as the data setup for your local environment, not need to click through the UI.

Of course, TestContainers allow you to do most of the magic, but then you need to learn the tool deeply to do that, which is kinda opposite to the premise of a seamless setup. Also, each dev environment supports a different feature set and has different documentation with not always detailed breakdowns.

**So, TLDR: TestContainers are nice, but they do not match my needs so far.** I'll try to go down that path and learn more to see if I can utilise it to my needs. I'll keep you posted.

**So far, vanilla Docker Compose works best for me; it's simple, flexible, and causes the least friction. I hope that this post will also make it as such for you.**

Cheers!

Read also other articles around DevOps process:
- [How to build an optimal Docker image for your application?](/pl/how_to_buid_an_optimal_docker_image_for_your_application/)
- [How to create a Docker image for the Marten application](/pl/marten_and_docker/)
- [A few tricks on how to set up related Docker images with docker-compose](/pl/tricks_on_how_to_set_up_related_docker_images/)
- [How to build and push Docker image with GitHub actions?](/pl/how_to_buid_and_push_docker_image_with_github_actions/)
- [How to create a custom GitHub Action?](/pl/how_to_create_a_custom_github_action/)

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
