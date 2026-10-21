import { searchManifest } from '../../lib/search.ts';
export async function GET() {
  return Response.json(await searchManifest(), {
    headers: { 'Cache-Control': 'no-cache' },
  });
}
