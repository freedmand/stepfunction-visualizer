<script context="module" lang="ts">
	import type {
		ExecutionDefinition,
		ExecutionGetResponse,
		StateMachineDescription,
		StepFunction
	} from '../../statemachine';
	import { History } from '../../history';
	import type { Load } from '@sveltejs/kit';

	const STATUS_COLORS = {
		FAILED: 'crimson'
	};

	export const load: Load = async ({ params, fetch }) => {
		const response = await fetch(`/get/${params.arn}/${params.execution}`);
		const result: ExecutionGetResponse = await response.json();
		return {
			props: {
				description: result.definition,
				execution: result.execution,
				history: new History(result.history),
				arn: params.arn
			}
		};
	};
</script>

<script lang="ts">
	import StepFunctionVisualization from '../../StepFunctionVisualization.svelte';

	export let description: StateMachineDescription;
	export let execution: ExecutionDefinition;
	export let history: History;
	export let arn: string;

	const stepFunction: StepFunction = JSON.parse(description.definition);
</script>

<h1><a href="/">Step Functions</a> / <a href="/{arn}">{description.name}</a> / {execution.name}</h1>

<table>
	<tr>
		<th>Name</th>
		<th>Status</th>
		<th>Execution ARN</th>
		<th>Input</th>
		<th>Start Date</th>
		<th>Stop Date</th>
	</tr>
	<tr>
		<td>
			{execution.name}
		</td>
		<td style="color: {STATUS_COLORS[execution.status] || 'black'}">
			{execution.status}
		</td>
		<td>
			{execution.executionArn}
		</td>
		<td>
			{execution.input}
		</td>
		<td>
			{execution.startDate}
		</td>
		<td>
			{execution.stopDate}
		</td>
	</tr>
</table>

<StepFunctionVisualization {stepFunction} {history} />
