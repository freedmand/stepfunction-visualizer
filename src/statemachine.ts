export interface StateMachine {
	stateMachineArn: string;
	name: string;
	type: string;
	creationDate: string;
}

export interface ListResponse {
	stateMachines: StateMachine[];
}

export interface GetResponse {
	definition: StateMachineDescription;
	executions: {
		executions: Execution[];
	};
}

export interface ExecutionGetResponse {
	definition: StateMachineDescription;
	execution: ExecutionDefinition;
	history: ExecutionHistory;
}

export interface Execution {
	name: string;
	status: string;
	executionArn: string;
	stateMachineArn: string;
	startDate: string;
	stopDate: string;
}

export interface ExecutionDefinition extends Execution {
	input: string;
}

export interface StateMachineDescription extends StateMachine {
	status: string;
	roleArn: string;
	definition: string;
}

export interface StepFunction {
	StartAt: string;
	States: { [state: string]: State };
	Comment?: string;
	TimeoutSeconds?: number;
	Version?: string;
}

interface BaseState {
	Type: string;
	Comment?: string;
	End?: boolean;
	Next?: string;
}

export type State = PassState | TaskState | ParallelState | MapState | ChoiceState;

export interface PassState extends BaseState {
	Type: 'Pass';
	ResultPath?: string;
	Result?: JSON;
	Parameters?: JSON;
}

export interface TaskState extends BaseState {
	Type: 'Task';
	Resource: string;
	ResultPath?: string;
	ResultSelector?: string;
	Parameters?: JSON;
	Retry?: JSON;
	Catch?: JSON;
	TimeoutSeconds?: number;
}

export interface ParallelState extends BaseState {
	Type: 'Parallel';
	Branches: StepFunction[];
	ResultPath?: string;
	ResultSelector?: string;
	Retry?: JSON;
	Catch?: JSON;
}

export interface MapState extends BaseState {
	Type: 'Map';
	Iterator: StepFunction;
	ItemsPath?: string;
	MaxConcurrency?: number;
	ResultPath?: string;
	ResultSelector?: string;
	Retry?: JSON;
	Catch?: JSON;
}

export interface ChoiceState extends BaseState {
	Type: 'Choice';
	Choices: {
		Next: string;
	}[];
	Default?: string;
}

export interface ExecutionHistory {
	events: ExecutionEvent[];
}

export interface BaseExecutionEvent {
	timestamp: string;
	id: string;
	previousEventId: string;
}

export type ExecutionEvent =
	| ExecutionStarted
	| StateEntered
	| LambdaFunctionScheduled
	| LambdaFunctionStarted
	| LambdaFunctionSucceeded
	| StateExited
	| ParallelStateSucceeded
	| LambdaFunctionFailed
	| ExecutionFailed;

export interface ExecutionStarted extends BaseExecutionEvent {
	type: 'ExecutionStarted';
	executionStartedEventDetails: {
		input: string;
		inputDetails: InputDetails;
		roleArn: string;
	};
}

export interface StateEntered extends BaseExecutionEvent {
	type: 'TaskStateEntered' | 'ParallelStateEntered';
	stateEnteredEventDetails: {
		name: string;
		input: string;
		inputDetails: InputDetails;
	};
}

export interface LambdaFunctionScheduled extends BaseExecutionEvent {
	type: 'LambdaFunctionScheduled';
	lambdaFunctionScheduledEventDetails: {
		resource: string;
		input: string;
		inputDetails: InputDetails;
	};
}

export interface LambdaFunctionStarted extends BaseExecutionEvent {
	type: 'LambdaFunctionStarted';
}

export interface LambdaFunctionSucceeded extends BaseExecutionEvent {
	type: 'LambdaFunctionSucceeded';
	lambdaFunctionSucceededEventDetails: {
		output: string;
		outputDetails: OutputDetails;
	};
}

export interface StateExited extends BaseExecutionEvent {
	type: 'TaskStateExited' | 'ParallelStateExited';
	stateExitedEventDetails: {
		name: string;
		output: string;
		outputDetails: OutputDetails;
	};
}

export interface ParallelStateSucceeded extends BaseExecutionEvent {
	type: 'ParallelStateSucceeded';
}

export interface LambdaFunctionFailed extends BaseExecutionEvent {
	type: 'LambdaFunctionFailed';
	lambdaFunctionFailedEventDetails: {
		error: string;
		cause: string;
	};
}

export interface ExecutionFailed extends BaseExecutionEvent {
	type: 'ExecutionFailed';
	executionFailedEventDetails: {
		error: string;
		cause: string;
	};
}

export interface InputDetails {
	truncated: boolean;
}

export interface OutputDetails {
	truncated: boolean;
}
