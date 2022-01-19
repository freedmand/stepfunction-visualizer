<script context="module" lang="ts">
	import type {
		Execution,
		GetResponse,
		StateMachineDescription,
		StepFunction
	} from '../statemachine';
	import type { Load } from '@sveltejs/kit';

	const STATUS_COLORS = {
		FAILED: 'crimson'
	};

	export const load: Load = async ({ params, fetch }) => {
		const response = await fetch(`/get/${params.arn}`);
		const result: GetResponse = await response.json();
		return {
			props: {
				description: result.definition,
				executions: result.executions.executions.sort((a, b) =>
					b.startDate.localeCompare(a.startDate)
				)
			}
		};
	};
</script>

<script lang="ts">
	import StepFunctionVisualization from '../StepFunctionVisualization.svelte';

	export let description: StateMachineDescription;
	export let executions: Execution[];
	const stepFunction: StepFunction = JSON.parse(description.definition);
</script>

<h1><a href="/">Step Functions</a> / {description.name}</h1>
<table>
	<tr>
		<th>Status</th>
		<th>Machine ARN</th>
		<th>Role ARN</th>
		<th>Type</th>
		<th>Creation Date</th>
	</tr>
	<tr>
		<td>
			{description.status}
		</td>
		<td>
			{description.stateMachineArn}
		</td>
		<td>
			{description.roleArn}
		</td>
		<td>
			{description.type}
		</td>
		<td>
			{description.creationDate}
		</td>
	</tr>
</table>

<h2>Executions</h2>

{#if executions.length == 0}
	<p>No executions found. Run the step function to create one.</p>
{:else}
	<table>
		<tr>
			<th>Name</th>
			<th>Status</th>
			<th>Execution ARN</th>
			<th>Start Date</th>
			<th>Stop Date</th>
		</tr>
		{#each executions as execution}
			<tr>
				<td>
					<a href="/{execution.stateMachineArn}/{execution.executionArn}">{execution.name}</a>
				</td>
				<td style="color: {STATUS_COLORS[execution.status] || 'black'}">
					{execution.status}
				</td>
				<td>
					{execution.executionArn}
				</td>
				<td>
					{execution.startDate}
				</td>
				<td>
					{execution.stopDate}
				</td>
			</tr>
		{/each}
	</table>
{/if}

<StepFunctionVisualization {stepFunction} />
