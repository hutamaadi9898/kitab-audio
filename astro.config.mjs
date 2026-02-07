// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [tailwind(), react()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    },
    imageService: 'cloudflare'
  })
});
