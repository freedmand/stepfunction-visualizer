import type { ExecutionEvent, ExecutionHistory, StateEntered, StateExited } from './statemachine';

export type Status = 'success' | 'fail' | 'neverrun' | 'indeterminate';

type EventType = 'task' | 'parallel' | 'map' | 'choice' | 'pass' | 'fail' | 'succeed' | 'wait' | null;

export interface Details {
	status: Status;
	input: JSON;
	output: JSON;
}

/**
 * A class that wraps an execution history of a step function
 * and provides utility functions to get the status of each
 * step
 */
export class History {
	constructor(readonly history: ExecutionHistory) { }

	getById(id: string): ExecutionEvent | null {
		// Find an event by id
		for (const event of this.history.events) {
			if (event.id == id) return event;
		}
		return null;
	}

	getByPreviousId(id: string): ExecutionEvent | null {
		// Find an event that matches the specified previous id
		for (const event of this.history.events) {
			if (event.previousEventId == id) return event;
		}
		return null;
	}

	getInputEvent(event: ExecutionEvent | null, type: EventType): StateEntered | null {
		// Get the input event corresponding to a given event
		if (event == null) return null;
		if (
			((type == 'task' || type == null) && event.type == 'TaskStateEntered') ||
			((type == 'parallel' || type == null) && event.type == 'ParallelStateEntered') ||
			((type == 'map' || type == null) && event.type == 'MapStateEntered') ||
			((type == 'choice' || type == null) && event.type == 'ChoiceStateEntered') ||
			((type == 'pass' || type == null) && event.type == 'PassStateEntered') ||
			((type == 'fail' || type == null) && event.type == 'FailStateEntered') ||
			((type == 'succeed' || type == null) && event.type == 'SucceedStateEntered') ||
			((type == 'wait' || type == null) && event.type == 'WaitStateEntered')
		) {
			return event;
		}
		return this.getInputEvent(this.getById(event.previousEventId), type);
	}

	getOutputEvent(event: ExecutionEvent | null, type: EventType): StateExited | null {
		// Get the output event corresponding to a given event
		if (event == null) return null;
		if (
			((type == 'task' || type == null) && event.type == 'TaskStateExited') ||
			((type == 'parallel' || type == null) && event.type == 'ParallelStateExited') ||
			((type == 'map' || type == null) && event.type == 'MapStateExited') ||
			((type == 'choice' || type == null) && event.type == 'ChoiceStateExited') ||
			((type == 'pass' || type == null) && event.type == 'PassStateExited') ||
			((type == 'fail' || type == null) && event.type == 'FailStateExited') ||
			((type == 'succeed' || type == null) && event.type == 'SucceedStateExited') ||
			((type == 'wait' || type == null) && event.type == 'WaitStateExited')
		) {
			return event;
		}
		return this.getOutputEvent(this.getByPreviousId(event.id), type);
	}

	getType(event: ExecutionEvent): EventType {
		// Get the type of an execution event
		// TODO: support Map and other types
		if (event.type.startsWith('Parallel')) return 'parallel';
		if (event.type.startsWith('Task')) return 'task';
		if (event.type.startsWith('Map')) return 'map';
		if (event.type.startsWith('Choice')) return 'choice';
		if (event.type.startsWith('Pass')) return 'pass';
		if (event.type.startsWith('Fail')) return 'fail';
		if (event.type.startsWith('Succeed')) return 'succeed';
		if (event.type.startsWith('Wait')) return 'wait';
		return null;
	}

	getStatus(name: string): Status {
		return this.getDetails(name).status;
	}

	getDetails(name: string): Details {
		// Get the details of a state in the execution history by name
		// (details returns status and input/output if available)
		let status: Status = 'neverrun';
		let input: JSON = null;
		let output: JSON = null;
		for (const event of this.history.events) {
			// Iterate through each event to track the state
			if (event.type == 'TaskStateEntered' || event.type == 'ParallelStateEntered' || event.type == 'MapStateEntered' || event.type == 'ChoiceStateEntered' || event.type == 'PassStateEntered') {
				if (event.stateEnteredEventDetails.name == name) {
					status = 'indeterminate';
					input = JSON.parse(event.stateEnteredEventDetails.input);
				}
			}

			if (event.type == 'LambdaFunctionSucceeded' || event.type == 'ParallelStateSucceeded' || event.type == 'MapStateExited' || event.type == 'ChoiceStateExited' || event.type == 'PassStateExited') {
				const eventType = this.getType(event);
				const startEvent = this.getInputEvent(event, eventType);
				const endEvent = this.getOutputEvent(event, eventType);
				if (startEvent.stateEnteredEventDetails.name == name) {
					status = 'success';
					input = JSON.parse(startEvent.stateEnteredEventDetails.input);
					if (endEvent != null) {
						output = JSON.parse(endEvent.stateExitedEventDetails.output);
					}
				}
			}

			if (event.type == 'LambdaFunctionFailed') {
				const eventType = this.getType(event);
				const startEvent = this.getInputEvent(event, eventType);
				const endEvent = this.getOutputEvent(event, eventType);

				if (startEvent.stateEnteredEventDetails.name == name) {
					status = 'fail';
					input = JSON.parse(startEvent.stateEnteredEventDetails.input);
					if (endEvent != null) {
						output = JSON.parse(endEvent.stateExitedEventDetails.output);
					}
					return { input, output, status };
				}
			}
		}

		return { input, output, status };
	}
}
