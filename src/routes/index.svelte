<script context="module" lang="ts">
	import type { ListResponse, StateMachine } from '../statemachine';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ fetch }) => {
		const response = await fetch('/list');
		const stateMachines: ListResponse = await response.json();
		return {
			props: {
				stateMachines: stateMachines.stateMachines
			}
		};
	};
</script>

<script lang="ts">
	export let stateMachines: StateMachine[];
</script>

<h1>Step Functions</h1>
<table>
	<tr>
		<th>Name</th>
		<th>ARN</th>
		<th>Type</th>
		<th>Creation Date</th>
	</tr>
	{#each stateMachines as stateMachine}
		<tr>
			<td>
				<a href="/{stateMachine.stateMachineArn}">{stateMachine.name}</a>
			</td>
			<td>
				{stateMachine.stateMachineArn}
			</td>
			<td>
				{stateMachine.type}
			</td>
			<td>
				{stateMachine.creationDate}
			</td>
		</tr>
	{/each}
</table>
