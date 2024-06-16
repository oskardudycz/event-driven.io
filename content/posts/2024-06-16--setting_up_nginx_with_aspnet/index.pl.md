---
title: Setting up NGINX load balancer for .NET WebApi
category: "DevOps"
cover: 2024-06-16-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-06-16-cover.png)

**_"Just put the load balancer in front of it, and call it a day"._** But is it really that simple? Was it ever "just do XYZ?". I was preparing a new [workshop](/en/training/) recently. I wanted to show how to load balance Marten Async Daemon - essentially, I wanted to expand the general explanation from my [previous article on scaling out Marten](/en/scaling_out_marten/). And of course, the 5-minute task of work appeared to be a bit longer. 

As I'm writing this blog, not to forget what I learned, so here it is: guidance on how to configure load balancing of ASP.NET Web Api using Nginx and Docker Compose.

**Let's say we have an ASP.NET WebApi running as a Docker container.** We'd like to run multiple instances of the same service to distribute the load evenly. The configuration made with the Docker Compose file could look as follows:

```yaml
version: "3.8"
services:
    backend:
        build:
            dockerfile: Dockerfile
            context: .
            args:
                project_name: Helpdesk.Api
                run_codegen: true
        deploy:
            replicas: 3
        depends_on:
            postgres:
                condition: service_healthy
        restart: always

    postgres:
        image: postgres:15.1-alpine
        container_name: postgres
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U postgres"]
            interval: 5s
            timeout: 5s
            retries: 5
        environment:
            - POSTGRES_DB=postgres
            - POSTGRES_PASSWORD=Password12!
        ports:
            - "5432:5432"
```

It's pretty standard for current applications. We have a WebApi service and related databases. In our case, that's Postgres, as we're running Marten as our storage library.

**The most critical and non-standard setting the number of replicas:**

```yaml
deploy:
    replicas: 3
```

Docker Compose allows us to define using the following syntax declaratively how many instances of the defined service we'd like to run. If we now run:

```shell
docker compose up -d
```

And then 

```shell
docker ps
```

We should see the four docker containers: 3 with WebAPI and one with PostgreSQL.

```shell
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS                    PORTS                    NAMES
d9f8e7410a84   helpdeskapi-backend    "/bin/sh -c 'dotnet …"   14 minutes ago   Up 1 minute (healthy)                              helpdeskapi-backend-2
399d8643bccd   helpdeskapi-backend    "/bin/sh -c 'dotnet …"   14 minutes ago   Up 1 minute (healthy)                              helpdeskapi-backend-1
90492d1c32bd   helpdeskapi-backend    "/bin/sh -c 'dotnet …"   14 minutes ago   Up 1 minute (healthy)                              helpdeskapi-backend-3
54327a5a155f   postgres:15.1-alpine   "docker-entrypoint.s…"   14 minutes ago   Up 1 minute (healthy)   0.0.0.0:5432->5432/tcp     postgres
```

It's essential to note here that we set the explicit name of the Postgres container in Docker Compose by setting _container\_name_. That makes diagnostics easier, as we did above. Yet, we cannot do it for the WebApi service, as we'll have more than one instance of the same service.

Now, all of our WebApi services will get different IP addresses but the same DNS name. It'll be the name of the service, so _backend_. Of course, this DNS name will be only available if we're inside the Docker internal networking (so between containers, but not in our local/host network). To make them accessible outside and load-balance the traffic, we need a dedicated service that'll handle that. 

We'll use Nginx, which is one of the most popular tools. It can be used both as a Reverse Proxy and a Load Balancer. 

Small reminder:
- **A reverse proxy is a server that sits between client devices and the backend servers.** Its main roles are to forward client requests to appropriate backend servers and send the responses back to the clients. 
- **Load balancing is the process of distributing incoming network traffic across multiple servers.** This is crucial for maintaining performance and availability, especially for high-traffic applications.

We'll start by extending our Docker Compose config with an additional service:

```yaml
version: "3.8"
services:
    # This is what we added
    nginx:
        restart: always
        image: nginx:alpine
        ports:
            - 8089:80
        volumes:
            - ./nginx.conf:/etc/nginx/nginx.conf
        depends_on:
            - backend

    backend:
        build:
            dockerfile: Dockerfile
            context: .
            args:
                project_name: Helpdesk.Api
                run_codegen: true
        deploy:
            replicas: 3
        depends_on:
            postgres:
                condition: service_healthy
        restart: always

    postgres:
        image: postgres:15.1-alpine
        container_name: postgres
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U postgres"]
            interval: 5s
            timeout: 5s
            retries: 5
        environment:
            - POSTGRES_DB=postgres
            - POSTGRES_PASSWORD=Password12!
        ports:
            - "5432:5432"
```

We added a new container running our Nginx load balancer. We're exposing its default _80_ port to a different one on our host (e.g. _8080_). It's a good idea to do this, as many web servers are using port _80_, and we'd like to avoid accidental conflicts. We also need to provide the configuration. We're doing that by mapping the _nginx.conf_ file from the same folder as our Docker Compose file into the configuration inside the Nginx container.

**And yes, we need to configure the _nginx.conf_ configuration file.** For our ASP.NET service, it should look as follows:

```toml
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    map $http_connection $connection_upgrade {
        "~*Upgrade" $http_connection;
        default keep-alive;
    }

    server {
        listen 80;
        location / {
            proxy_pass         http://backend:5248/;
            proxy_http_version 1.1;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection $connection_upgrade;
            proxy_set_header   Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }
    }
}

```

Configuration is short, but there are some things to unpack here.

1. **We're configuring the HTTP requests redirection.** Nginx can also do more, such as TCP (e.g., PostgreSQL load balancing, but that's not what we're here for). That's why we setup HTTP server configuration explicitly.
2. **We're load-balancing all requests by setting _/_ as location.** Nginx is a highly customisable and advanced tool. We could define more advanced rules and patterns, but that'll be enough for our case.
3. **We're forwarding all those requests to our backend by defining:
   ```
 _proxy_pass         http://backend:5248/;
   ```
1. **Nginx is listening on port 80.** We could also put another port address here; the most important thing is to have it aligned with the port redirection in Docker Compose.

Plus, we have a few additional configurations needed:

1. **_map $http\_connection $connection\_upgrade { ... }_** This block configures how Nginx handles connections, particularly differentiating between standard HTTP connections and upgraded WebSocket connections. ASP.NET Core applications, including those exposing APIs, might use WebSockets for real-time communication (e.g., SignalR). The map directive ensures that Nginx correctly upgrades HTTP connections to WebSockets when required, facilitating features like live updates in the UI or interactive API testing. For the same reasons, we also have below **_proxy\_set\_header Connection $connection\_upgrade_** and **_proxy\_cache\_bypass $http\_upgrade_** to handle WebSockets correctly (forward the upgraded headers and bypass cache, as it's not applicable to WebSockets).
2. **_proxy\_http\_version 1.1_** -  Enforces HTTP/1.1 for proxying requests. HTTP/1.1 is necessary for features like keep-alive connections and WebSockets, which can be important for efficiently managing long-lived connections and real-time features in ASP.NET applications and for the Swagger UI's interactive elements.
3. **_proxy\_set\_header   Host $host_** -  This header maintains the original Host header from the client request. ASP.NET applications must receive the original _Host_ header for routing purposes and for the Swagger UI to correctly generate API endpoint URLs matching the client's request host. For the same reasons we also set **_proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for_** and **_proxy\_set\_header X-Forwarded-Proto $scheme_**. The former adds the client's IP address to the _X-Forwarded-For_ header. The latter sets the protocol (HTTP or HTTPS) the original client uses. They're critical to enforcing the correct security and generating the correct redirections used by Swagger UI.

We also use the default configs:
1. **_worker\_processes auto;_** This directive specifies the number of worker processes Nginx should spawn. Setting it to auto lets Nginx automatically determine the optimal number of worker processes based on the available CPU cores. This improves the server's performance and efficiency.
2. **_events { worker\_connections 1024; }_** Defines the maximum number of simultaneous connections each worker process can handle. In this case, it's set to 1024 connections per worker.

As you see, there are a lot of settings related to the proper WebSockets configuration and request URI redirections. Those are the trickiest parts, where "just use load balancer" becomes a typical "thank you for nothing" type of advice. To make that work fully, we also need to adjust our ASP.NET configuration. We need to add:

```csharp
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Define the availability on all IPs with the defined port
builder.WebHost.UseUrls("http://*:5248");

// (...)  other configs

// Header forwarding to enable Swagger in Nginx
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var app = builder.Build();

// (...) other configuration
app.UseSwagger()
   .UseSwaggerUI()
    // Header forwarding to enable Swagger in Nginx
   .UseForwardedHeaders();
```

I've spent a lot of time realising that besides _launchSettings.json_:

```json
{
    "profiles": {
        "Helpdesk.Api": {
            "commandName": "Project",
            "dotnetRunMessages": true,
            "launchBrowser": true,
            "launchUrl": "swagger/index.html",
            "applicationUrl": "http://localhost:5248",
            "environmentVariables": {
                "ASPNETCORE_ENVIRONMENT": "Development"
            }
        }
    }
}
```

I also need to replicate the application URL explicitly in the ASP.NET configuration. I also need to specify the wildcard in the URL instead of the _localhost_ or _127.0.0.1_. They won't work out of the box. See also the [official guide in the ASP.NET documentation](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-8.0&tabs=linux-ubuntu).

**In the end, once you know it, then this looks not so hard and kinda makes sense, but yeah, once you know it. Before that, it's never "just do XYZ".**

If you get to this place, then you may also like my other articles around Docker and Continuous Integration:
- [A simple way to configure integration tests pipeline](/en/configure_ci_for_integration_tests/)
- [How to build an optimal Docker image for your application?](/en/how_to_buid_an_optimal_docker_image_for_your_application/)
- [Docker Compose Profiles, one the most useful and underrated features](/en/docker_compose_profiles)
- [A few tricks on how to set up related Docker images with docker-compose](/en/tricks_on_how_to_set_up_related_docker_images/)
- [How to build and push Docker image with GitHub actions?](/en/how_to_buid_and_push_docker_image_with_github_actions/)
- [How to configure a custom Test Container on the EventStoreDB example](/en/custom_test_container_on_esdb_example/)
- [How to create a Docker image for the Marten application](/en/marten_and_docker)
- [How to create a custom GitHub Action?](/en/how_to_create_a_custom_github_action/)

**Also feel free to [contact me!](mailto:oskar@event-driven.io) if you think that I could help your project. I'm open on doing consultancy and mentoring to help you speed up and streghten your systems.**

Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
