import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ports } from '../../src/connections';
import { eventually, sleep } from '../testClients';

const leaderScript = path.resolve(import.meta.dirname, '../../e2e/leader.ts');

type LeaderNode = { process: ChildProcess; output: string[] };

describe('Leader election between two separate processes', () => {
  const nodes: LeaderNode[] = [];

  const startNode = (name: string, port: number, database: string) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', leaderScript, name, String(port), database],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const node: LeaderNode = { process: child, output: [] };
    child.stdout?.on('data', (data: Buffer) =>
      node.output.push(...data.toString().trim().split('\n')),
    );
    child.stderr?.on('data', (data: Buffer) =>
      node.output.push(`stderr: ${data.toString()}`),
    );
    nodes.push(node);
    return node;
  };

  const leaders = () =>
    nodes.flatMap((node) =>
      node.output.filter((line) => line.endsWith("I'm the leader")),
    );

  const crash = async (node: LeaderNode) => {
    if (node.process.exitCode !== null || node.process.signalCode !== null)
      return;
    const exited = new Promise((resolve) => node.process.once('exit', resolve));
    node.process.kill('SIGKILL');
    await exited;
  };

  afterEach(async () => {
    await Promise.all(nodes.splice(0).map(crash));
  });

  it('through PgBouncer in session mode, only one node is the leader, and the other takes over when it crashes', async () => {
    const a = startNode('A', ports.session, 'app');
    await eventually(
      () => Promise.resolve(leaders()),
      (current) => current.length === 1,
    );
    startNode('B', ports.session, 'app');

    await sleep(1_000);
    expect(leaders()).toEqual(["A: I'm the leader"]);

    await crash(a);

    expect(
      await eventually(
        () => Promise.resolve(leaders()),
        (current) => current.length === 2,
      ),
    ).toEqual(["A: I'm the leader", "B: I'm the leader"]);
  });

  it('through PgBouncer in transaction mode, both nodes become the leader', async () => {
    startNode('A', ports.transaction, 'app');
    await eventually(
      () => Promise.resolve(leaders()),
      (current) => current.length === 1,
    );
    startNode('B', ports.transaction, 'app');

    expect(
      await eventually(
        () => Promise.resolve(leaders()),
        (current) => current.length === 2,
      ),
    ).toEqual(["A: I'm the leader", "B: I'm the leader"]);
  });
});
