<script lang="ts">
	import mermaid from 'mermaid/dist/mermaid.esm.min.mjs';
	import { onDestroy, onMount } from 'svelte';
	import type { History } from './history';
	import type { State, StepFunction } from './statemachine';
	import { stepFunctionToMermaid } from './visualize';

	const JSON_INDENT = 2;
	const PADDING = 5;

	export let stepFunction: StepFunction;
	export let history: History | null = null;
	const { flowchart, context } = stepFunctionToMermaid(stepFunction, history);
	let selectedState: State | StepFunction = stepFunction;
	let selectedStateKey: string | null = null;
	let selectedElement: SVGElement | null = null;
	let hoveredElement: SVGElement | null = null;
	let prevSelectedElement: SVGElement | null = null;
	let prevHoveredElement: SVGElement | null = null;
	let selectedInput: JSON = null;
	let selectedOutput: JSON = null;

	$: {
		// Get the input/output of the selected state, if available
		if (selectedStateKey != null && history != null) {
			const normalizedKey = selectedStateKey.substring(
				selectedStateKey.indexOf('-') + 1,
				selectedStateKey.lastIndexOf('_')
			);
			const { input, output } = history.getDetails(normalizedKey);
			selectedInput = input;
			selectedOutput = output;
		} else {
			selectedInput = null;
			selectedOutput = null;
		}
	}

	$: {
		// Reset styles of previously hovered/selected elements
		if (prevHoveredElement != null) {
			prevHoveredElement.style.filter = 'contrast(1)';
		}
		if (prevSelectedElement != null) {
			prevSelectedElement.style.filter = 'contrast(1)';
		}

		// Set styles of hovered/selected elements
		if (hoveredElement != null) {
			hoveredElement.style.filter = 'contrast(0.8)';
		}
		if (selectedElement != null && selectedElement == hoveredElement) {
			selectedElement.style.filter = 'contrast(0.5)';
		} else if (selectedElement != null) {
			selectedElement.style.filter = 'contrast(0.6)';
		}

		// Update previous elements
		prevSelectedElement = selectedElement;
		prevHoveredElement = hoveredElement;
	}

	let container: HTMLElement;

	function clearContainer() {
		if (container != null) {
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
		}
	}

	onMount(() => {
		mermaid.initialize({ startOnLoad: false });
		clearContainer();
		mermaid.render('mermaid-container', flowchart, (svgCode) => {
			container.innerHTML = svgCode;

			// Resize SVG to fit
			const bbox = (container.querySelector('svg > g') as SVGGraphicsElement).getBBox();
			container
				.querySelector('svg')
				.setAttribute(
					'viewBox',
					`${bbox.x - PADDING} ${bbox.y - PADDING} ${bbox.width + PADDING * 2} ${
						bbox.height + PADDING * 2
					}`
				);

			// Bind IDs
			const elements: { stateKey: string; value: State; element: SVGElement }[] = Object.keys(
				context.states
			).map((stateKey) => ({
				stateKey,
				value: context.states[stateKey],
				element:
					container.querySelector(`[id^='${stateKey}']`) ||
					container.querySelector(`[id^='flowchart-${stateKey}']`)
			}));
			for (const { stateKey, value, element } of elements) {
				element.style.cursor = 'pointer';
				element.style.userSelect = 'none';
				element.addEventListener('mouseover', () => (hoveredElement = element));
				element.addEventListener('mouseout', () => (hoveredElement = null));
				element.addEventListener('click', () => {
					if (element == selectedElement) {
						selectedElement = null;
						selectedState = stepFunction;
						selectedStateKey = null;
					} else {
						selectedElement = element;
						selectedState = value;
						selectedStateKey = stateKey;
					}
				});
			}
		});
	});

	onDestroy(() => {
		clearContainer();
	});
</script>

<h2>Definition</h2>
<table>
	<tr>
		<td style="min-width: min(50vw, 420px);">
			<div bind:this={container} />
		</td>
		<td>
			{#if selectedInput != null}
				<details open>
					<summary>Input</summary>
					<pre>{JSON.stringify(selectedInput, null, JSON_INDENT)}</pre>
				</details>
			{/if}
			{#if selectedOutput != null}
				<details open>
					<summary>Output</summary>
					<pre>{JSON.stringify(selectedOutput, null, JSON_INDENT)}</pre>
				</details>
			{/if}
			<details open>
				<summary>Details</summary>
				<pre>{JSON.stringify(
						selectedState,
						(k, v) => {
							if (k == 'States') return Object.keys(v);
							return v;
						},
						JSON_INDENT
					)}</pre>
			</details>
		</td>
	</tr>
</table>
