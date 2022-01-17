import type { RequestHandler } from '@sveltejs/kit/types/endpoint';
import { execSync } from 'child_process';

export const get: RequestHandler = async () => {
	const output = execSync(
		'aws stepfunctions --endpoint http://localhost:8083 --output json list-state-machines'
	);
	return {
		body: output
	};
};
