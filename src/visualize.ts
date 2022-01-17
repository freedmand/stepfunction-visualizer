import type { History } from './history';
import type { State, StepFunction } from './statemachine';

const STATE_FILLS = {
	success: 'lightgreen',
	fail: 'lightcoral',
	neverrun: 'gainsboro',
	indeterminate: 'grey'
};

class Context {
	public id = 0;
	public states: { [id: string]: State } = {};

	constructor(readonly history: History | null = null) {}

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
	stepFunction: StepFunction,
	type: 'normal' | 'parallel' | 'map' = 'normal'
): string {
	const id = context.getId();

	const getId = (stateKey) => `${id}-${stateKey}_`;

	let result = '';
	const startBrace = type == 'normal' ? ['[', ']'] : type == 'parallel' ? ['{{', '}}'] : ['[', ']'];
	result += `${getId(stepFunction.StartAt)}\n`;
	for (const stateKey of Object.keys(stepFunction.States)) {
		const state = stepFunction.States[stateKey];
		context.registerState(getId(stateKey), state);
		result += convertNode(context, getId, stateKey, state);
		const brace = stepFunction.StartAt == stateKey ? startBrace : ['[', ']'];
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
			return `${getId(stateKey)}[${JSON.stringify(stateKey)}]\n`;
		case 'Task':
			return `${getId(stateKey)}[${JSON.stringify(stateKey)}]\n`;
		case 'Parallel':
			return `subgraph ${getId(stateKey)} [${JSON.stringify(stateKey)}]
direction ${DIRECTION}
${state.Branches.map((branch) => convertStepFunction(context, branch, 'parallel')).join('\n')}
end\n`;
		case 'Map':
			return `subgraph ${getId(stateKey)} [${JSON.stringify(stateKey)}]
style ${getId(stateKey)} stroke-dasharray: 5 5
click ${getId(stateKey)} callback	"tooltip"
direction ${DIRECTION}
${convertStepFunction(context, state.Iterator, 'map')}
end\n`;
	}
}
