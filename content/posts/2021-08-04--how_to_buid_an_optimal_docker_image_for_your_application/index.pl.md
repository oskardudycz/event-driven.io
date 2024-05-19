---
title: How to build an optimal Docker image for your application?
category: "DevOps"
cover: 2021-08-04-cover.png
author: oskar dudycz
useDefaultLangCanonical : true
---

![cover](2021-08-04-cover.png)

Some time ago, I realised that my posts from 2011 about configuration and operation in SCRUM using TFS are still hanging on the Internet. Actually, I shouldn't really brag about it, because nowadays it can be a bit embarrassing. However, that's a decent confirmation that I was interested since the beginning in Continuous Integration and Delivery. 

I have come across a lot of CI/CD platforms throughout my career. Starting with Hudson (now renamed Jenkins), TFS, Bamboo (yup...), Jenkins, Azure DevOps, GitHub Actions etc. Since the beginning, nothing irritated me as much as manually copying files to FTP. I always hated running some magic scripts praying for luck. When I started out in 2007, times were wild. Some say that _"It used to be better and devs were more skilled. You had to know how to write scripts and how deployment works."_. From my perspective, it's better that you might not need to know it now because tools are better. In my opinion, the more repetitive, boring activities you have to perform manually, the greater the chance that you will make a mistake.

What do my inclinations for event-based architectures and CI/CD have in common? Focus on the essence, so making sure the system works in the right way. Both in terms of business and technology. The more we automate, the more we can focus on delivering business value.

Today, I would like to share a Docker build configuration for my Event Sourcing sample repositories. I'll explain it based on the .NET and NodeJS applications. I think that the three aspects that I used there may be helpful to you as well:
1. Layers and why you should remember about them.
2. Multi-stage build.
3. Deploying the image to the repository (this is explained in the [dedicated post](/pl/how_to_buid_and_push_docker_image_with_github_actions)).

 In this post, I'll focus on the most important things for the developer, so pardon me, simplifications made for brevity.

**Container image definition**: what is in the _DOCKERFILE_. We can compare it to the instructions for assembling a table. We describe what steps must be performed to put individual elements together. 

**Container image** is an already assembled table that is somewhere in the warehouse. Downloading the Docker image (via _docker pull_ command) can be compared to delivering the table from the warehouse to your home. Launching (_docker run_) can be compared to unpacking this table and using it.

What's important (and indirectly connected with Event Sourcing) is that everything in containers is _immutable_. Just like a table in a warehouse once packed, no one should move until the buyer opens it, and the images should not (and cannot) be modified.

The same goes for the individual parts. If we assemble a table, it usually means that _"first, assemble one leg, then the second, third, fourth, top, and finally turn it into one whole"_. When we have glued it together or twisted it, we also try not to change it because we may not turn it back later.

The same is true of Docker. **When defining the container image, each instruction (line) creates a new _layer_.** The layer can be compared to a twisted tabletop, to which we will then screw the legs.

Why am I talking about this? Because such layers should be placed one after the other, from the least changeable to the most common. **Typically, the process of building a project in Docker is:**
1. Copy the project files.
2. Start the build process.
3. Use the artefacts and run the project.

With build tools, we usually can build anything and generate artefacts with a single command. **However, it's a good idea to break these steps down into separate steps.** That is:
- package installation: _dotnet restore_, _npm install_,
- building a project: _dotnet build_, _npm run build_,
- creating final artefacts: _dotnet publish_, _npm prune --production_.

Why? Installing packages does not require the entire project. To do it, we only need the project file.  Docker is so clever that it only rebuilds the layers (represented by lines in Dockerfile) in which something has changed. That can be a definition or the copied files. If we first copy the project file and run the package installation, it will only trigger this step on subsequent builds if the project file we copied has changed (i.e. we added a new package, updated its version, etc.). Thanks to this, we can cut the valuable build time.

In .NET it will look like that:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS builder

# Setup working directory for the project	 
WORKDIR /app

COPY ./Core/Core.csproj ./Core/	
COPY ./Core.Marten/Core.Marten.csproj ./Core.Marten/	 
COPY ./Core.WebApi/Core.WebApi.csproj ./Core.WebApi/	 
COPY ./Sample/Tickets/Tickets/Tickets.csproj ./Sample/Tickets/Tickets/	 
COPY ./Sample/Tickets/Tickets.Api/ ./Sample/Tickets/Tickets.Api/	 

# Restore nuget packages	 
RUN dotnet restore ./Sample/Tickets/Tickets.Api/Tickets.Api.csproj
```
I'm copying more than one project file, as I need to have all the referenced projects to restore all packages successfully.

NodeJS application config is similar:

```dockerfile
FROM node:lts-alpine AS builder

# Setup working directory for project
WORKDIR /app

COPY ./package.json ./	 
COPY ./package-lock.json ./	 
COPY ./tsconfig.json ./	 

# install node modules
# use `npm ci` instead of `npm install`
# to install the exact versions from `package-lock.json`
RUN npm ci
```

If we change any file in the project, this fragment will not be rerun. Docker will use the previously generated layer.

**The next step is to copy the project files and run the build.**

The key here is to ensure that our build command won't install dependencies automatically again, _dotnet build_ does that. However, we can run it with _---no-restore_  parameter, which will prevent packages from being downloaded again.

```dockerfile
# Copy project files
COPY ./Core ./Core
COPY ./Core.Marten ./Core.Marten
COPY ./Core.WebApi ./Core.WebApi
COPY ./Sample/Tickets/Tickets ./Sample/Tickets/Tickets
COPY ./Sample/Tickets/Tickets.Api ./Sample/Tickets/Tickets.Api	 

# Build project with Release configuration
# and no restore, as we did it already
RUN dotnet build -c Release --no-restore ./Sample/Tickets/Tickets.Api/Tickets.Api.csproj
```

In NodeJS this will look similar:

```dockerfile
# Copy project files  
COPY src ./src

# Build project
RUN npm run build:ts
```

**Finally, we should prepare the final artefacts.** Again we don't want to repeat ourselves. While creating the deployment package, we don't want to build source codes again. 

In .NET, while running _dotnet publish_, we have to add the _--no-build_ option to achieve that.

```dockerfile
# Publish project to output folder	 
# and no build, as we did it already	 
WORKDIR /app/Sample/Tickets/Tickets.Api	 
  
RUN dotnet publish -c Release --no-build -o out
```

In NodeJS, it's a bit different, as we're not generating the result binaries, but _just_ cleaning the unused dependencies.

```dockerfile
# sets environment to production
# and removes packages from devDependencies	 
  
RUN npm prune --production
```

In theory, we could release such a Docker image. However, besides the result packages, it would contain source codes and all the build tools we used. Typically images that have the development SDK preinstalled is heavier. That means that downloading and using it takes more resources. We'd like to optimise that.

**Fortunately, Docker can do multi-stage build**. What is it that? In short, by using _FROM_, we're telling what image should be our _base image_. Such an image simply defines what we will already have installed and configured on our system.

We can have more than one _FROM_ in our build definition. When we do that, we will create another image defined _"on the side"_. What's essential is that it has access to all the others images that we created earlier.

So we can use a heavier image from the SDK, generate artefacts in it, and then use a lighter image with a minimal number of dependencies (e.g. only runtime). Thanks to this, we can copy the previously generated files to it.

This is what the final definition looks like for .NET

```dockerfile
# the first, heavier image to build your code
FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS builder

# (...)

# second, final, lighter image
FROM mcr.microsoft.com/dotnet/aspnet:5.0-alpine

# Setup working directory for the project  
WORKDIR /app

# Copy published in previous stage binaries	 
  
# from the `builder` image
COPY --from=builder /app/Sample/Tickets/Tickets.Api/out .	 

# Set URL that App will be exposed	 
ENV ASPNETCORE_URLS="http://*:5000"	 

# sets entry point command to automatically	 
# run application on `docker run`	 
ENTRYPOINT ["dotnet", "Tickets.Api.dll"]
```

For NodeJS, we can use the same image, as we didn't use additional build tools. However, we still benefit from having only the result files in the final image.

```dockerfile
# the first image to build your code
FROM node:lts-alpine AS builder

# (...)

# second, final, lighter image without source code and build dependencies
FROM node:lts-alpine

# Setup working directory for the project
WORKDIR /app

# Copy published in previous stage binaries
# from the `builder` image
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set URL that App will be exposed
EXPOSE 5000

# sets entry point command to automatically
# run application on `docker run`
ENTRYPOINT ["node", "./dist/index.js"]
```

See the final images in my sample repos:
- [.NET](https://github.com/oskardudycz/EventSourcing.NetCore/blob/main/Dockerfile)
- [NodeJs](https://github.com/oskardudycz/EventSourcing.NodeJS/blob/main/samples/simple/Dockerfile)	


By using _ENTRYPOINT_ we tell Docker to start our project as the default command. It's also one of the best practices for someone to just do a _docker run_ and start the project executable with the default settings.

The image built in this way can be used to implement and run in the final environment. To do this, we need to push it into the repository. The default and the most popular is DockeHub. The other popular is GitHub Container Registry.

We can also use such an image for manual and automated tests.

**To sum up - thanks to a few simple tricks, we can make the build time significantly shorten**. In addition, it won't contain unnecessary files and dependencies. Thanks to that, downloading it and launching it will be faster. As you see, these rules can be applied to any platform. I showed .NET and NodeJS as an example, but the same could be done in other environments.

I encourage you to also read the follow-up articles ["How to build and push Docker image with GitHub actions?"](/pl/how_to_buid_and_push_docker_image_with_github_actions) and [A few tricks on how to set up related Docker images with docker-compose](/pl/tricks_on_how_to_set_up_related_docker_images/).

Read also other articles around DevOps process:
- [A simple way to configure integration tests pipeline](/pl/configure_ci_for_integration_tests/)
- [How to create a Docker image for the Marten application](/pl/marten_and_docker/)
- [Docker Compose Profile, one the most useful and underrated features](/pl/docker_compose_profiles/)
- [A few tricks on how to set up related Docker images with docker-compose](/pl/tricks_on_how_to_set_up_related_docker_images/)
- [How to build and push Docker image with GitHub actions?](/pl/how_to_buid_and_push_docker_image_with_github_actions/)
- [How to create a custom GitHub Action?](/pl/how_to_create_a_custom_github_action/)

Cheers!

Oskar