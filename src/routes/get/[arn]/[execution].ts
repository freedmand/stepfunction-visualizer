import type { RequestHandler } from '@sveltejs/kit/types/endpoint';
import { execSync } from 'child_process';

export const get: RequestHandler = async ({ params }) => {
	const arn = params.arn;
	const executionArn = params.execution;
	const definition = execSync(
		`aws stepfunctions --endpoint http://localhost:8083 --output json describe-state-machine --state-machine-arn ${arn}`
	);
	const execution = execSync(
		`aws stepfunctions --endpoint http://localhost:8083 --output json describe-execution --execution-arn ${executionArn}`
	);
	const history = execSync(
		`aws stepfunctions --endpoint http://localhost:8083 --output json get-execution-history --execution-arn ${executionArn}`
	);
	return {
		body: {
			definition: JSON.parse(definition.toString()),
			execution: JSON.parse(execution.toString()),
			history: JSON.parse(history.toString())
		}
	};
};
