<!--
Copyright (c) 2026 Cadbos company. All rights reserved.

SPDX-License-Identifier: LicenseRef-AI-Design-Singer-BSL-1.1

AI Design Singer is licensed under the Business Source License 1.1.
Production use is limited to signing in to AI design services operated by
Cadbos company. See LICENSE for complete terms.
-->

<script lang="ts">
	import { Globe } from '@lucide/svelte';

	interface Props {
		origin: string;
	}

	let { origin }: Props = $props();
</script>

<p class="origin">
	<Globe size={16} strokeWidth={1.8} aria-hidden="true" />
	<span>{new URL(origin).host}</span>
</p>

<style>
	.origin {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-radius: var(--radius);
		background: rgb(47 111 79 / 0.1);
		color: var(--color-accent-text);
		font-weight: 600;
		word-break: break-all;
	}
</style>
