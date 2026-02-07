/// <reference types="astro/client" />

import type { D1Database } from '@cloudflare/workers-types';

interface Env {
  TWS_DB: D1Database;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare global {
	namespace App {
		interface Locals extends Runtime {}
	}
}

export {};
