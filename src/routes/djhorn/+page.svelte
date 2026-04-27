<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import BigRedButton from './BigRedButton.svelte';

	let audio: HTMLAudioElement | undefined;

	onMount(() => {
		if (browser) {
			// Create a simple beep sound using Web Audio API as fallback
			const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

			// Try loading the MP3 first
			audio = new Audio('/horn.mp3');

			audio.addEventListener('error', (e) => {
				console.error('MP3 failed to load, using synthetic beep');
				// Fallback to synthetic beep
				audio = undefined;
			});

			audio.addEventListener('canplaythrough', () => {
				console.log('MP3 loaded successfully');
			});
		}
	});

	function honk() {
		if (audio) {
			console.log('Playing MP3');
			audio.load();
			audio.play().catch((error) => {
				console.error('MP3 play failed:', error);
				playSyntheticHorn();
			});
		} else {
			playSyntheticHorn();
		}
	}

	function playSyntheticHorn() {
		if (!browser) return;

		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		// Create a horn-like sound (low frequency)
		oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
		oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);

		// Envelope
		gainNode.gain.setValueAtTime(0, audioContext.currentTime);
		gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.5);

		console.log('Playing synthetic horn');
	}
</script>

<svelte:head>
	<title>djhorn</title>
	<meta name="description" content="djhorn" />
</svelte:head>

<BigRedButton onclick={honk} />
