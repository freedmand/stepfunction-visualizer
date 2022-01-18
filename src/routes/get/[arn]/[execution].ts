import type { RequestHandler } from '@sveltejs/kit/types/endpoint';
import { SFN } from '@aws-sdk/client-sfn';

const sfn = new SFN({
	endpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:8083'
});

export const get: RequestHandler = async ({ params }) => {
	const arn = params.arn;
	const executionArn = params.execution;
	const definition = await sfn.describeStateMachine({ stateMachineArn: arn });
	const execution = await sfn.describeExecution({ executionArn });
	const history = await sfn.getExecutionHistory({
		executionArn
	});
	return {
		body: {
			definition,
			execution,
			history
		}
	};
};
