import { R2Bucket } from '@cloudflare/workers-types';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				STARGATE_BUCKET: R2Bucket;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
