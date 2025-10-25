import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const faviconPath = join(process.cwd(), 'public', 'favicon.ico');
  const faviconBuffer = readFileSync(faviconPath);

  return new Response(faviconBuffer, {
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
