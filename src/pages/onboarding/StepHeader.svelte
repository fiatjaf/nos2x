<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Signer-BSL-1.1

AI Design Signer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { ti } from '../../lib/i18n/index.svelte';

	interface Props {
		progress: { current: number; total: number };
		title: string;
	}

	let { progress, title }: Props = $props();
</script>

<div class="step-header">
	<p class="progress">{ti('auth.setup.progress', progress)}</p>
	<h1>{title}</h1>
</div>

<style>
	.step-header {
		display: grid;
		gap: 4px;
	}

	.progress {
		color: var(--color-accent-text);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}
</style>
