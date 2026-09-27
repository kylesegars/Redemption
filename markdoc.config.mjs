import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    // Matches the "YouTube video" block in keystatic.config.ts
    youtube: {
      render: component('./src/components/YouTube.astro'),
      attributes: { url: { type: String, required: true } },
      selfClosing: true,
    },
  },
});
