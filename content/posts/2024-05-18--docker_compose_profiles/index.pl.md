---
title: Docker Compose Profiles, one the most useful and underrated features
category: "DevOps"
cover: 2024-05-18-cover.png
author: oskar dudycz
useDefaultLangCanonical: true
---

![](2024-05-18-cover.png)

**[Erik Shafer](https://www.event-sourcing.dev/about/) asked me on the [Emmett Discord](https://discord.gg/fTpqUTMmVa) if I could provide a sample of how to run the WebApi application using [Emmett](https://event-driven-io.github.io/emmett/getting-started.html).** Of course, I said: _sure will!_ I already had [WebApi sample in the repository](https://github.com/event-driven-io/emmett/tree/main/samples/webApi/expressjs-with-esdb) I also explained here [How to build and push Docker image with GitHub actions?](/pl/how_to_buid_and_push_docker_image_with_github_actions/). Easy peasy, then, right?

Indeed, it wasn't that hard. Of course, I had to fight with [ESModules quirks](/pl/how_to_tackle_esmodules_compatibility_issues/), but I also expanded the scope a bit, as I also decided to use one of the most underrated Docker Compose features: [Profiles](https://docs.docker.com/compose/profiles/).

## What are Docker Compose Profiles?

They're a way to logically group services inside your Docker Compose definition, allowing you to run a subset of services. My original Docker Compose definition contained the [EventStoreDB](https://developers.eventstore.com/) startup, which I use in my Emmett samples as the real event store example.

```yaml
version: '3.5'

services:
  eventstoredb:
    image: eventstore/eventstore:23.10.0-bookworm-slim
    container_name: eventstoredb
    environment:
      - EVENTSTORE_CLUSTER_SIZE=1
      - EVENTSTORE_RUN_PROJECTIONS=All
      - EVENTSTORE_START_STANDARD_PROJECTIONS=true
      - EVENTSTORE_EXT_TCP_PORT=1113
      - EVENTSTORE_HTTP_PORT=2113
      - EVENTSTORE_INSECURE=true
      - EVENTSTORE_ENABLE_EXTERNAL_TCP=true
      - EVENTSTORE_ENABLE_ATOM_PUB_OVER_HTTP=true
    ports:
      - '1113:1113'
      - '2113:2113'
    volumes:
      - type: volume
        source: eventstore-volume-data
        target: /var/lib/eventstore
      - type: volume
        source: eventstore-volume-logs
        target: /var/log/eventstore
    networks:
      - esdb_network

networks:
  esdb_network:
    driver: bridge

volumes:
  eventstore-volume-data:
  eventstore-volume-logs:
```

Nothing fancy here so far. You can just run it with:

```bash
docker compose up
```

It will start the database; then, you can run a sample application with

```bash
npm run start
``` 

And play with Emmett.

I wanted to keep the sample experience straightforward and use local development/debugging as the default. Docker image build and run would be optional (we could call it _"Erik's mode"_!).

Now, profiles come in handy here, as they enable that, I just had to add:

```yaml
version: '3.5'

services:
  app:
    build:
      dockerfile: Dockerfile
      context: .
    container_name: emmett_api
    profiles: [app]
    environment:
      - ESDB_CONNECTION_STRING=esdb://eventstoredb:2113?tls=false
    networks:
      - esdb_network
    ports:
      - '3000:3000'

  # (...) EventStoreDB Definition
```

The setup is pretty straightforward.

We're stating which Docker file to use and where it is located.

```yaml
    build:
      dockerfile: Dockerfile
      context: .
```

Used **_._** means that the build context will be the folder as the location of the docker-compose file. _dockerfile_ tells where the Docker file is located. In our case, it's the same folder as the docker-compose file, and it's named _Dockerfile_. That also opens more options. We could also define it as:

```yaml
    build:
      dockerfile: src/app/Dockerfile
      context: .
```

That'd allow us to use some common dependencies outside the project folder, e.g. _src/build_. Essentially, we could expand the image-building process's access to additional locations and allow project files to access parent folders to use, for instance, shared configurations or dependencies. Thanks go to [Jakub Gutkowski](https://www.linkedin.com/in/jakubg/) for [pointing that out](https://www.linkedin.com/feed/update/urn:li:activity:7197619396448546816?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7197619396448546816%2C7197654708721737728%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287197654708721737728%2Curn%3Ali%3Aactivity%3A7197619396448546816%29)!.

We ensure that we have a connection to EventStoreDB by placing it in the same network and passing the connection string as an environment variable.

```yaml
    environment:
      - ESDB_CONNECTION_STRING=esdb://eventstoredb:2113?tls=false
    networks:
      - esdb_network
```

The _new thing_ is the profile definition:

```yaml
    profiles: [app]
```

Thanks to that, we're saying that this service will only be used if we explicitly specify that in the command line. We can, for instance build the image by running

```yaml
docker compose --profile app build
```

Or run both EventStoreDB and Emmett WebApi by calling:

```yaml
docker compose --profile app up
```

And let's stop here for a moment! Why **both** if I specified the _app_ profile? Docker Compose will run, in this case, specified profile **AND** all services that don't have a profile specified. That's quite neat, as we can define the set of default services (e.g. databases, messaging systems, etc.) and add others as optional. Ah, and you can specify multiple profiles by, e.g.:

```
docker compose --profile backend --profile frontend up
```

You can also group multiple services into a single profile. Why would you do it? Let's go to...

## Docker Profiles advanced scenario

**In my [Event Sourcing .NET samples repository](https://github.com/oskardudycz/EventSourcing.NetCore), I'm trying to cover multiple aspects, tools, ways to build Event Sourcing, CQRS and Event-Driven systems.** I'm using:
- Marten (so Postgres) and EventStoreDB as example event stores,
- Postgres and Elasticsearch as read model stores,
- Kafka used for integration between services,
- UI tools like PgAdmin and Kafka UI to easier investigate sample data.

**Multiple samples are using those services in various configurations.**

I'm also using them in [my Event Sourcing workshops](/pl/training/), so I'd like to ensure the setup is smooth and we can focus on learning and not fighting with Docker.

Initially, I kept multiple Docker Compose files for:
- default configuration with all services,
- continuous integration pipeline configuration without UI components, as they're not needed for tests. They'd just eat resources and make pipeline runs longer. They also don't have Kafka, as I'm just testing inner modules functionalities,
- sample web API Docker Image build (similar to the one explained above),
- only containing Postgres-related configurations,
- accordingly, only with EventStoreDB,
- etc.

I'm sure that you can relate that to your projects. Now, how can Docker Compose Profiles help us with that? It could definitely help us merge multiple configurations into one and easier manage updating versions, etc.

Let's see the config I ended up with and then explain the reasoning. I'll trim the detailed service configuration; you can check the whole file [here](https://github.com/oskardudycz/EventSourcing.NetCore/blob/39bc20bdcf2df3480fdf96519682a5c54638bf00/docker-compose.yml).

```yaml
version: "3"
services:
    #######################################################
    #  Postgres
    #######################################################
    postgres:
        profiles: [ postgres, postgres-all, all, all-no-ui, ci ]
        image: postgres:15.1-alpine
	      # (...) rest of the config

    pgadmin:
        profiles: [ postgres-ui, postgres-all, all ]
        image: dpage/pgadmin4
	      # (...) rest of the config

    #######################################################
    #  EventStoreDB
    #######################################################
    eventstore.db:
        image: eventstore/eventstore:23.10.0-bookworm-slim
        profiles: [ eventstoredb, eventstoredb-all, all, all-no-ui, ci ]
	      # (...) rest of the config

    #######################################################
    #  Elastic Search
    #######################################################
    elasticsearch:
        image: docker.elastic.co/elasticsearch/elasticsearch:8.13.2
        profiles: [ elastic, elastic-all, all, all-no-ui, ci ]
	      # (...) rest of the config

    kibana:
        image: docker.elastic.co/kibana/kibana:8.13.2
        profiles: [ elastic-ui, elastic-all, all ]
	      # (...) rest of the config

    #######################################################
    #  Kafka
    #######################################################
    kafka:
        image: confluentinc/confluent-local:7.6.1
        profiles: [kafka, kafka-all, all, all-no-ui]
	      # (...) rest of the config

    init-kafka:
        image: confluentinc/confluent-local:7.6.1
        profiles: [ kafka, kafka-all, all, all-no-ui ]
        command: "#shell script to setup Kafka topics"
	      # (...) rest of the config
        
    schema_registry:
        image: confluentinc/cp-schema-registry:7.6.1
        profiles: [ kafka-ui, kafka-all, all ]        
	      # (...) rest of the config

    kafka_topics_ui:
        image: provectuslabs/kafka-ui:latest
        profiles: [ kafka-ui, kafka-all, all ]
        depends_on:
            - kafka
	      # (...) rest of the config

    #######################################################
    #  Open Telemetry
    #######################################################
    jaeger:
        image: jaegertracing/all-in-one:latest
        profiles: [ otel, otel-all, all ]
	      # (...) rest of the config

    #######################################################
    #  Test Backend Service
    #######################################################
    backend:
        build:
            dockerfile: Dockerfile
            context: .
        profiles: [build]
	    # (...) rest of the config

## (...) Network and Volumes config
```

As you see, we have a few general profiles:
- _postgres_
- _elastic_
- _kafka_
- _eventstoredb_
- _otel_
- _build_

They group the needed tooling containers.

Each of them has the additional profiles with prefixes:
- _{profile}-all_ (e.g. _postgres-all_) - will start all needed tooling containers plus supportive like ui,
- _{profile}-all-no-ui_ - will start just the needed tooling without UI components. There's no _{profile}-all-ui_, as starting UI without actual components doesn't make sense.

I also defined additional profiles:
- _all_ - that'll run all components,
- _ci_ - only components needed for the CI pipeline (so no UI and Kafka).

So by default, if I don't mind my RAM being eaten by all containers, I'd run:

```bash
docker compose --profile all up
```

If I'd like to run the Marten sample with Elasticsearch read models, I could just run:

```yaml
docker compose --profile postgres --profile elastic up
```

In the CI, I can run:

```yaml
docker compose --profile ci up
```

**It's important to find balance and conventions for profile names.** If you have too many of them, it'll be challenging for people to memorise all of them. That's why grouping them and adding standard conventions can be helpful. We should always consider intended usage and make it accessible. I could potentially provide profiles for dedicated samples.

Read more in the official [Docker Compose Profiles guide](https://docs.docker.com/compose/profiles/).

See also the Pull Requests where I introduced explained changes to:
- [Emmett](https://github.com/event-driven-io/emmett/pull/67),
- [EventSourcing .NET](https://github.com/oskardudycz/EventSourcing.NetCore/pull/258).

If you get to this place, then you may also like my other articles around Docker and Continuous Integration:
- [A simple way to configure integration tests pipeline](/pl/configure_ci_for_integration_tests/)
- [How to build an optimal Docker image for your application?](/pl/how_to_buid_an_optimal_docker_image_for_your_application/)
- [A few tricks on how to set up related Docker images with docker-compose](/pl/tricks_on_how_to_set_up_related_docker_images/)
- [How to build and push Docker image with GitHub actions?](/pl/how_to_buid_and_push_docker_image_with_github_actions/)
- [How to configure a custom Test Container on the EventStoreDB example](/pl/custom_test_container_on_esdb_example/)
- [How to create a Docker image for the Marten application](/pl/marten_and_docker)
- [How to create a custom GitHub Action?](/pl/how_to_create_a_custom_github_action/)


Cheers!

Oskar

p.s. **Ukraine is still under brutal Russian invasion. A lot of Ukrainian people are hurt, without shelter and need help.** You can help in various ways, for instance, directly helping refugees, spreading awareness, putting pressure on your local government or companies. You can also support Ukraine by donating e.g. to [Red Cross](https://www.icrc.org/pl/donate/ukraine), [Ukraine humanitarian organisation](https://savelife.in.ua/pl/donate/) or [donate Ambulances for Ukraine](https://www.gofundme.com/f/help-to-save-the-lives-of-civilians-in-a-war-zone).
