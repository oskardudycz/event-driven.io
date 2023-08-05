---
title: How to build and push Docker image with GitHub actions?
category: "DevOps"
cover: 2021-08-11-cover.png
author: oskar dudycz
---

![cover](2021-08-11-cover.png)

In the [previous post](/en/how_to_buid_an_optimal_docker_image_for_your_application), I explained that with a few simple tricks, you can make your Docker image less cluttered and build faster. I explained practical patterns on how to do that. 

This time I'll take a step forward and explain how to publish the image to the Docker registry. It's a place in which you can store your Docker images. You can use them to share images with your team or deploy them to your hosting environment (e.g. Kubernetes, or another container hosting). We'll use GitHub Actions as an example. It has a few benefits:
- it's popular and easy to set up,
- it's free for Open Source projects,
- by design, it integrates easily with GitHub tools like [GitHub Container Registry](https://github.com/features/packages).

It's a quickly evolving, decent tool. Of course, it's not perfect. Documentation is not great, but that's also the reason why I'm writing this post.

We'll use two popular Docker registries:
- [Docker Hub](https://hub.docker.com/): the default one, provided by Docker. It's commonly used for the public available images. If you run _docker pull_, it'll try to load the image from it by default. However, from November 2020, it has [significant limits for free accounts](https://www.docker.com/blog/docker-hub-image-retention-policy-delayed-and-subscription-updates/).
- [GitHub Container Registry (GHCR)](https://github.com/features/packages): GitHub introduced its container registry as a Packages service spin-off (you can use it to host artefacts like NPM, NuGet packages, etc.). It allows both public and private hosting (which is crucial for commercial projects).

Before we push images, we need to do a basic setup for the container registry:

## Docker Hub publishing setup

1. Create an account and sign in to [Docker Hub](https://hub.docker.com).
2. Go to Account Settings => Security: [link](https://hub.docker.com/settings/security) and click **New Access Token**.
3. Provide the name of your access token, save it and copy the value (you won't be able to see it again, you'll need to regenerate it).
4. Go to your GitHub secrets settings (Settings => Secrets, url https://github.com/{your_username}/{your_repository_name}/settings/secrets/actions).
5. Create two secrets (they won't be visible for other users and will be used in the non-forked builds)
- *DOCKERHUB_USERNAME* - with the name of your Docker Hub account (do not mistake it with GitHub account)
- *DOCKERHUB_TOKEN* - with the pasted value of a token generated in point 3.

## Github Container Registry publishing setup

1. [Enable GitHub Container Registry](https://docs.github.com/en/packages/guides/enabling-improved-container-support). Profile => Feature Preview => Improved Container Support => Enable.
2. Create [GitHub Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) in your profile [developer settings page](https://github.com/settings/tokens). Copy the value (you won't be able to see it again, you'll need to regenerate it). Select at least following scopes:
- _repo_
- _read:packages_
- _write:packages_
4. Go to your GitHub secrets settings (Settings => Secrets, url https://github.com/{your_username}/{your_repository_name}/settings/secrets/actions).
5. Navigate to your package landing page https://github.com/{your_username}/{your_repository_name}/pkgs/container/{your_package_name}. Grant GitHub action  write access (more in [GitHub Registry docs](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions#upgrading-a-workflow-that-accesses-ghcrio)). By that, as long as user running action has proper permissions (we can also setup them to automatically derive them from repository config) we can use default [*GITHUB_TOKEN* secret](https://docs.github.com/en/actions/reference/authentication-in-a-workflow#about-the-github_token-secret). Thanks, @Brickwall, for pointing that out in the [comment](https://event-driven.io/en/how_to_buid_and_push_docker_image_with_github_actions/#comment-5915972111)!

Once we have Docker registries setup, we can create a workflow file. It should be located in the _.\.github\workflows_ directory in our repository. Let's name it _build-and-publish.yml_.

We'll run this pipeline when Pull Request is created and on the main branch. We'll be pushing the Docker image only on the main branch because we don't want to spam the registry with intermediate images. If you want to, e.g. run manual tests for the pull request branch - you may also consider publishing also prerelease packages. 

The process will look as follows:
1. Use working directory where Dockerfile is located (e.g. _src_)
1. Checkout code.
2. Log in to DockerHub and GHCR using credentials set up in the previous step.
3. Build Docker image.
4. Publish Docker image if the pipeline is running on the main branch.

The pipeline has to be run on the Linux machine, as Windows and macOS lack Docker configuration.

The resulting file will look as follow:

```yml
name: Build and Publish

on:
  # run it on push to the default repository branch
  push:
    branches: [main]
  # run it during pull request
  pull_request:

jobs:
  # define job to build and publish docker image
  build-and-push-docker-image:
    name: Build Docker image and push to repositories
    # run only when code is compiling and tests are passing
    runs-on: ubuntu-latest

    # steps to perform in job
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      # setup Docker buld action
      - name: Set up Docker Buildx
        id: buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Login to Github Packages
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build image and push to Docker Hub and GitHub Container Registry
        uses: docker/build-push-action@v2
        with:
          # relative path to the place where source code with Dockerfile is located
          context: ./src/samples/simple
          # Note: tags has to be all lower-case
          tags: |
            oskardudycz/eventsourcing.nodejs.simple:latest 
            ghcr.io/oskardudycz/eventsourcing.nodejs/simple:latest
          # build on feature branches, push only on main branch
          push: ${{ github.ref == 'refs/heads/main' }}

      - name: Image digest
        run: echo ${{ steps.docker_build.outputs.digest }}
```

As you see the pipeline is technology agnostic. You can reuse it in whatever technology you choose. This gives a lot of possibilities to simplify pipelines and processing.

Read also other articles around DevOps process:
- [A simple way to configure integration tests pipeline](/en/configure_ci_for_integration_tests/)
- [How to build an optimal Docker image for your application?](/en/how_to_buid_an_optimal_docker_image_for_your_application/)
- [How to create a Docker image for the Marten application](/en/marten_and_docker/)
- [A few tricks on how to set up related Docker images with docker-compose](/en/tricks_on_how_to_set_up_related_docker_images/)
- [How to create a custom GitHub Action?](/en/how_to_create_a_custom_github_action/)

Cheers!

Oskar