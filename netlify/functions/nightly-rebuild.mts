/**
 * Rebuilds the site once a day so past events are removed from the HTML itself.
 * (Events are also hidden in the browser the moment they end — this just keeps
 * the published pages and search results tidy.)
 *
 * Setup: Netlify → Site configuration → Build & deploy → Build hooks → "Add build hook",
 * then save the URL as an environment variable named BUILD_HOOK_URL.
 */
import type { Config } from '@netlify/functions';

export default async () => {
  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) {
    console.log('BUILD_HOOK_URL is not set; skipping nightly rebuild.');
    return;
  }
  const res = await fetch(hook, { method: 'POST' });
  console.log(`Triggered rebuild: ${res.status}`);
};

// 08:00 UTC = 3–4am US Central. Adjust per church if you like.
export const config: Config = { schedule: '0 8 * * *' };
