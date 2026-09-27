// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  // Replace with the church's production URL (used for canonical URLs and social cards).
  site: 'https://example-church.netlify.app',
  output: 'static',
  adapter: netlify(),
  integrations: [react(), markdoc(), keystatic()],
  trailingSlash: 'ignore',
});
