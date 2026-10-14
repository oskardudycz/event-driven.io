import assert from 'node:assert/strict';
import { parseAllRedirects } from 'netlify-redirect-parser';

type Redirect = {
  from: string;
  to: string;
  status: number;
  force?: boolean;
  query: Record<string, string>;
  conditions: { Language?: string[] };
};

function parsedRedirect(value: unknown): Redirect {
  assert.ok(value && typeof value === 'object', 'Expected a redirect object');
  assert.ok('from' in value && typeof value.from === 'string');
  assert.ok('to' in value && typeof value.to === 'string');
  assert.ok('status' in value && typeof value.status === 'number');
  assert.ok(!('force' in value) || typeof value.force === 'boolean');
  assert.ok('query' in value && value.query && typeof value.query === 'object');
  for (const query of Object.values(value.query))
    assert.equal(typeof query, 'string', 'Expected a literal query condition');
  return value as Redirect;
}

// The official parser validates Netlify syntax but publishes unknown[] results.
// Narrow that boundary once so route assertions can use its normalized rules.
export async function builtRedirects(): Promise<Redirect[]> {
  const { redirects, errors } = await parseAllRedirects({
    redirectsFiles: ['public/_redirects'],
    netlifyConfigPath: 'netlify.toml',
    configRedirects: [],
    minimal: true,
  });
  assert.deepEqual(errors, []);
  return redirects.map(parsedRedirect);
}

const matchesPath = (from: string, path: string) =>
  from.endsWith('/*') ? path.startsWith(from.slice(0, -1)) : from === path;

const matchesQuery = (
  ruleQuery: Record<string, string>,
  query: Record<string, string>,
) =>
  Object.keys(ruleQuery).length === 0 ||
  (Object.keys(ruleQuery).length === Object.keys(query).length &&
    Object.entries(ruleQuery).every(([key, value]) => query[key] === value));

// Netlify applies the first rule that matches, reading _redirects before
// netlify.toml. A rule without query parameters matches any query string.
export function firstRedirect(
  rules: Redirect[],
  path: string,
  request: {
    query?: Record<string, string>;
    language?: string | undefined;
  } = {},
): Redirect | undefined {
  const { query = {}, language } = request;
  return rules.find(
    (rule) =>
      matchesPath(rule.from, path) &&
      matchesQuery(rule.query, query) &&
      (!rule.conditions.Language ||
        (language !== undefined &&
          rule.conditions.Language.includes(language))),
  );
}
