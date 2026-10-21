import type { APIRoute } from 'astro';
import { searchIndex, searchManifest } from '../../lib/search.ts';

export async function getStaticPaths() {
  const manifest = await searchManifest();
  return Object.entries(manifest).map(([language, url]) => ({
    params: { language, version: url.split('.')[1] },
  }));
}

export const GET: APIRoute = async ({ params }) =>
  new Response(await searchIndex(params.language!), {
    headers: { 'Content-Type': 'application/json' },
  });
