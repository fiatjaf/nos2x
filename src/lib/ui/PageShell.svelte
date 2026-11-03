<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Brand from './Brand.svelte';
	import LocaleSwitch from './LocaleSwitch.svelte';
	import logo from './logo.svg';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="page">
	<img class="watermark" src={logo} alt="" />
	<main class="card">
		<header class="header">
			<Brand />
			<LocaleSwitch />
		</header>
		{@render children()}
	</main>
</div>

<style>
	.page {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: clamp(16px, 6vh, 64px) 16px;
		overflow: hidden;
		background: var(--backdrop);
		background-attachment: fixed;
	}

	.watermark {
		position: absolute;
		left: clamp(-160px, -6vw, -40px);
		bottom: -12vh;
		width: min(70vh, 52vw);
		opacity: 0.09;
		filter: brightness(0) invert(1);
		pointer-events: none;
		user-select: none;
	}

	.card {
		position: relative;
		width: min(400px, 100%);
		padding: 24px;
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		box-shadow: var(--shadow-card);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 20px;
		margin-bottom: 20px;
		border-bottom: 1px solid var(--color-border);
	}

	@media (max-width: 720px) {
		.watermark {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.page {
			padding: 12px;
		}

		.card {
			padding: 20px;
		}

		.header {
			padding-bottom: 16px;
			margin-bottom: 16px;
		}
	}
</style>
