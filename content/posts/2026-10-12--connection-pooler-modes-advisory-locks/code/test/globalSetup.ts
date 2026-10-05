import path from 'node:path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import type { StartedDockerComposeEnvironment } from 'testcontainers';

let environment: StartedDockerComposeEnvironment | undefined;

export const setup = async () => {
  environment = await new DockerComposeEnvironment(
    path.resolve(import.meta.dirname, '..'),
    'docker-compose.yml',
  )
    .withWaitStrategy('postgres-1', Wait.forHealthCheck())
    .up();
};

export const teardown = async () => {
  await environment?.down();
};
