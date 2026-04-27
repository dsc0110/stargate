import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const { a, b } = (await request.json()) as { a: number; b: number };
    return json(a + b);
};