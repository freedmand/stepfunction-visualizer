import type { RequestHandler } from '@sveltejs/kit/types/endpoint';
import { execSync } from 'child_process';

export const get: RequestHandler = async ({ params }) => {
	const arn = params.arn;
	const definition = execSync(
		`aws stepfunctions --endpoint http://localhost:8083 --output json describe-state-machine --state-machine-arn ${arn}`
	);
	const executions = execSync(
		`aws stepfunctions --endpoint http://localhost:8083 --output json list-executions --state-machine-arn ${arn}`
	);
	return {
		body: {
			definition: JSON.parse(definition.toString()),
			executions: JSON.parse(executions.toString())
		}
	};
};
