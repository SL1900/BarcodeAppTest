<script lang="ts">
	//
	import { BarcodeDetector } from "barcode-detector/pure";
	import { onMount } from "svelte";

	let detector = new BarcodeDetector();

	let img;
	let vsource: HTMLVideoElement;

	let list: {
		[code: string]: {
			format: string,
			value: string,
			time: number
		}
	} = {};

	async function startCam() {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				facingMode: "environment",
			},
		});
		vsource.srcObject = stream;
		vsource.play();

		setInterval(async () => {
			//
			let track = stream.getVideoTracks()[0].applyConstraints({
				// @ts-ignore
				focusMode: "continuous",
			});
			let res = await detector.detect(vsource);
			//console.log(res);
			for (let match of res) {
				//
				list[match.rawValue] = {
					format: match.format,
					value: match.rawValue,
					time: Date.now(),
				};
				console.log(match.format, match.rawValue);
			}
		}, 200);
	}
	onMount(() => {
		//
	});
</script>

<main>
	<video bind:this={vsource} width="200" height="300" />
	<div on:click={startCam}>start</div>
	<div>Test</div>
	<h1>Welcome to SvelteKit</h1>
	<p>
		Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
	</p>
	<div class="list">
		{#each Object.entries(list) as i}
			<div class="item">{i[1].format}:{i[1].value}</div>
		{/each}
	</div>
</main>

<style>
	.item {
		animation: ease 1s n_i;
	}
	@keyframes n_i {
		0% {
			background-color: rgb(0, 255, 0);
		}
		100% {
			background-color: rgb(255, 255, 255);
		}
	}
</style>
