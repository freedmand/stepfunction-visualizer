import type { RequestHandler } from '@sveltejs/kit/types/endpoint';
import { SFN } from '@aws-sdk/client-sfn';

const sfn = new SFN({
	endpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:8083'
});

export const get: RequestHandler = async ({ params }) => {
	const arn = params.arn;
	const definition = await sfn.describeStateMachine({ stateMachineArn: arn });
	const executions = await sfn.listExecutions({ stateMachineArn: arn });
	return {
		body: {
			definition,
			executions
		}
	};
};
