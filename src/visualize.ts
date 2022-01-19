import type { History } from './history';
import type { ChoiceState, State, StepFunction } from './statemachine';

const STATE_FILLS = {
	success: 'lightgreen',
	fail: 'lightcoral',
	neverrun: 'gainsboro',
	indeterminate: 'grey'
};

const DEFAULT_BRACE = ['[', ']'];
const BRACES = {
	Choice: ['([', '])'],
	Pass: ['((', '))'],
	Fail: ['[/', '\\]'],
	Succeed: ['[\\', '/]'],
	Wait: ['[/', '/]']
};

class Context {
	public id = 0;
	public states: { [id: string]: State } = {};

	constructor(readonly history: History | null = null) { }

	getId(): string {
		return `s${this.id++}`;
	}

	registerState(id: string, state: State) {
		this.states[id] = state;
	}
}

const DIRECTION = 'TB';

export function stepFunctionToMermaid(
	stepFunction: StepFunction,
	history: History | null
): {
	flowchart: string;
	context: Context;
} {
	const context = new Context(history);
	return {
		flowchart: `flowchart ${DIRECTION}
${convertStepFunction(context, stepFunction)}`,
		context
	};
}

function convertStepFunction(
	context: Context,
	stepFunction: StepFunction
): string {
	const id = context.getId();

	const getId = (stateKey) => `${id}-${stateKey}_`;

	let result = '';
	result += `${getId(stepFunction.StartAt)}\n`;
	for (const stateKey of Object.keys(stepFunction.States)) {
		const state = stepFunction.States[stateKey];
		context.registerState(getId(stateKey), state);
		result += convertNode(context, getId, stateKey, state);
		const brace = BRACES[state.Type] || DEFAULT_BRACE;
		result += `${getId(stateKey)}${brace[0]}${JSON.stringify(stateKey)}${brace[1]}\n`;
		if (context.history != null) {
			const nodeState = context.history.getStatus(stateKey);
			result += `style ${getId(stateKey)} fill:${STATE_FILLS[nodeState]}\n`;
		}
		if (state.Next != null) {
			result += `${getId(stateKey)} --> ${getId(state.Next)}\n`;
		}
	}
	return result;
}

export function convertNode(
	context: Context,
	getId: (string) => string,
	stateKey: string,
	state: State
): string {
	switch (state.Type) {
		case 'Pass':
		case 'Task':
		case 'Fail':
		case 'Succeed':
		case 'Wait':
			return `${getId(stateKey)}[${JSON.stringify(stateKey)}]\n`;
		case 'Parallel':
			return `subgraph ${getId(stateKey)} [${JSON.stringify(stateKey)}]
direction ${DIRECTION}
${state.Branches.map((branch) => convertStepFunction(context, branch)).join('\n')}
end\n`;
		case 'Map':
			return `subgraph ${getId(stateKey)} [${JSON.stringify(stateKey)}]
style ${getId(stateKey)} stroke-dasharray: 5 5
click ${getId(stateKey)} callback	"tooltip"
direction ${DIRECTION}
${convertStepFunction(context, state.Iterator)}
end\n`;
		case 'Choice':
			return `${convertChoice(context, getId, stateKey, state)}\n`;
	}
}

export function convertChoice(
	context: Context,
	getId: (string) => string,
	stateKey: string,
	choice: ChoiceState
): string {
	const possibleNextStates: string[] = [];
	const pushToNext = (s: string): void => {
		if (possibleNextStates.includes(s)) return;
		possibleNextStates.push(s);
	};
	for (const { Next } of choice.Choices) {
		// Add all the choices
		pushToNext(Next);
	}
	if (choice.Default != null) {
		// Add the default, if set
		pushToNext(choice.Default);
	}
	// Create arrows for all the states
	let result = '';
	for (const next of possibleNextStates) {
		result += `${getId(stateKey)} --> ${getId(next)}\n`;
	}
	return result;
}
